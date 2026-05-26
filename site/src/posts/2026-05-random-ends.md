---
title: Tying Random Ends (Adventures in Optimization)
description: Simulating, curve-fitting, optimizing, and ultimately solving a probability puzzle about tying random string ends together.
date: 2026-05-24
tags:
  - programming
  - mathematics
layout: layouts/post.njk
petiteVue: true
---

In an effort to stave off the absolute existential dread that accompanies me with both a) doing my Master's in AI and b) being a software engineer in 2026, I find it soothing to go back to my roots and solve interesting problems for the hell of it.

This 3blue1brown YouTube short recently popped into my feed:

<figure>
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZHXt0-_gSj4?si=6qJXXDBL_ryMeyfg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</figure>

In short, the problem is this:

> Suppose you drop $n$ random strings of yarn into a box. Then you randomly pick two ends of the strings and connect them. Sometimes, you will make a loop of string. Sometimes you will not. You repeat this process until there are no more ends left. **For 50 strings, what is the expected number of loops that you will end up with?**

It's short problems like these that I really enjoy solving. I like to call these kinds of questions "intellectual junk food" - small, tight, neat little problems that are *made* to be solved, and usually have a small "eureka moment" to give you that hit of dopamine your brain desperately craves. (Though I guess a more common term would be "puzzles" now that I think about it...) These questions give you a nice break from the messy real world, where solutions aren't so clear-cut.

When solving these types of problems, especially when dealing with probability, I like to do a computer simulation at first. However, something clicked this time when I watched this video. I realized that I could also come up with various functions, give them parameters, and fit the data to it using PyTorch. Cue all the actuaries giving me a disapproving look for just now realizing this, but hey, we all get there eventually, right?

## Creating the Simulation

First up was the simulation logic. This is pretty self-explanatory. Since each string is fully defined by its ends, that's the only thing I have to keep track of. I number the ends from `0` up to `2n-1`, put them in a list, and keep track of each end's corresponding other end on the string.

Now, note that when you connect two ends, they get removed from consideration. They either form a loop, or they get attached to another string. Either way, they aren't "ends" anymore.

Thus, we can remove the ends from the list. If the ends already correspond to each other, then we have a loop! Otherwise, we made a string and need to make the ends of this new string correspond to each other.

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 12, 39 %}

I then sample this for a bunch of strings and trials for each string length.

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 42, 51 %}

Next up is to code some PyTorch models with tunable parameters. I have a feeling that this is going to increase sharply at first, and then slowly as the number of strings increase. I come up with 4 functions: one based on the harmonic series, a logarithm, a power function, and a polynomial function.

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 56, 108 %}

Now, fundamentally what we are doing is taking a large number of samples from model defined in `perform`, all independent and identically distributed. Because of the [central limit theorem](https://en.wikipedia.org/wiki/Central_limit_theorem), we know that the sample mean becomes a good approximation of the true mean of the underlying distribution. In this case, that's the expected number of created loops which is exactly what we are trying to find!

Thus, I can fit the hypotheses using `Adam` and `MSELoss`, using the mean as the data. I also log the 95% confidence interval and r-squared for good measure.

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 110, 147 %}

Then plot:

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 152, 175 %}

And the main function:

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 179, 200 %}


And, in less than a second, out popped an image!

<figure>
<img src="{{ '/assets/posts/2026-05-random-ends/random-ends-v1.png' | url }}">
<figcaption>100 string lengths, 100 trials each.</figcaption>
</figure>

Good data! However, I'd like to have more trials per string length to tighten that CI. Additionally, I'd like to extend the graph out further to the right. Let's go to `run_trials_python(1000, 1000)` and see.

I ran the program and... 

```sh
--- Phase 1: Gather data max_n_strings=1000 ---
  Took 484.36 seconds.
--- Phase 2: Fit hypotheses ---
harmonic: 0.5031 * H(n) + 0.6705 (R²=0.9896)
log: 0.4982 * ln(n) + 0.9913 (R²=0.9898)
power: 1.3690 * n^0.1752 (R²=0.9278)
polynomial: -0.0000n² + 0.0155n + -0.0904 (R²=-2.8770)
  Took 5.96 seconds.
--- Phase 3: Plot ---
  Saved to random-ends-v1.png
```

484.36 seconds. The speed was bugging me. 484.36 seconds? Surely it can be faster. Wait a minute... A main function that calls a `perform` function? Making things efficient? Perhaps I can use... C++? Like a sleeper agent, all of my competitive programming experience came rushing back to me.

<figure>
<img src="https://64.media.tumblr.com/4b233ef8655d1840f75e2f5e7dc996bf/tumblr_inline_o7rgdtlvF01r4sdhv_500.gifv">
<figcaption>
Longing. Rusted. Seventeen. Daybreak. Furnace. Nine. Benign. Homecoming. One. Freight Car.
</figcaption>
</figure>

## Making it faster

A few insights:

First, this problem is embarrassingly parallel. Each trial is independent of one another. We could totally take advantage of more cores and get a pretty nice speedup.

Next, we don't actually have to remove the ends from the `all_ends` list. Once we're done with them, we never look at those ends again. Another equivalent way to get this functionality is to simply generate a list of all ends, shuffle them, then go through the list linearly. This is great because, say it with me, heap allocations are slow!

Furthermore, I'm reminded of this famous quote by Robert Galanakis:

> The fastest code is the code that does not run.
>
> <cite>Robert Galanakis</cite>

We are definitely performing too many trials on the smaller string lengths and not enough on the larger ones. Recall the central limit theorem. We can take $k$ samples from an arbitrary distribution. We know that the mean of these samples is approximately normally distributed with mean $\mu$ and variance $\sigma^2/k$. The standard deviation of this distribution, $\sigma/\sqrt{k}$, is called the [standard error](https://en.wikipedia.org/wiki/Standard_error). We don't know the true $\sigma$, but we can approximate it using [Bessel's correction](https://en.wikipedia.org/wiki/Bessel%27s_correction): $s^2 = \sum_{i=1}^{k} (x_i - \bar{x})^2 / (k - 1)$.

So instead of doing a fixed number of trials, we can keep running trials until the standard error drops below a desired threshold.

Finally, we could definitely use memory more efficiently. Why are we using a dictionary when an array would do just fine? Why not allocate all the memory we could possibly need at the beginning?

Putting it all together, the core simulation function looks like this. Each thread grabs the next unprocessed string count from an atomic counter, runs trials until the standard error is tight enough, and moves on:

{% codefile "assets/posts/2026-05-random-ends/random-ends-v2.cpp", "cpp", 9, 68 %}

Note the `result = 1` on line 39 - the last remaining string *must* form a loop, so we skip that iteration entirely. It's a tiny optimization, but it made me feel clever.

The `main` function just spins up threads and collects results. Each thread gets its own pre-allocated result vector to avoid contention:

{% codefile "assets/posts/2026-05-random-ends/random-ends-v2.cpp", "cpp", 70, 101 %}

There are many forms of inter-process communication, but I decided to just simply spit the results out to stdout as a csv file. Taking everything into account, need we update the Python script to shell out to the compiled binary and read the CSV output back in:

{% codefile "assets/posts/2026-05-random-ends/random-ends-v2.py", "python", 56, 68 %}

Moment of truth:

```bash
--- Phase 1: Gather data max_n_strings=1000 ---
  Took 0.94 seconds.
--- Phase 2: Fit hypotheses ---
harmonic: 0.5055 * H(n) + 0.6530 (R²=0.9895)
log: 0.5006 * ln(n) + 0.9753 (R²=0.9897)
power: 1.3651 * n^0.1756 (R²=0.9286)
polynomial: -0.0000n² + 0.0155n + -0.0904 (R²=-2.8137)
  Took 6.12 seconds.
--- Phase 3: Plot ---
  Saved to random-ends-v2.png
```

484 seconds down to 0.94. A **515x speedup**. I'm not going to pretend I didn't fist pump at my desk.

<figure>
<img src="{{ '/assets/posts/2026-05-random-ends/random-ends-v2.png' | url }}">
<figcaption>1,000 string lengths with adaptive trials, completed in under a second.</figcaption>
</figure>

So obviously the polynomial approximation is right out. The power model also seems to drift. That leaves the harmonic model and the natural log model, both with suspiciously similar $R^2$ values. Suspicious enough to make you wonder if they're secretly the same thing...

## Making it even faster

In my thirst for optimization, I tried to think about the problem in a slightly different manner. I began to think about how I could potentially eliminate the `end_seq` and `end_map` vectors altogether.

In the dark recesses of my brain, I conjured up a vague idea of [feistel ciphers](https://en.wikipedia.org/wiki/Feistel_cipher), but they only work for powers of two. While yes they are $O(1)$ in space complexity, in the worst case, for an arbitrary $n$, we will have to perform $2^{\lfloor \log_2( n ) \rfloor}$ operations. No, this will not do.

Instead, I reached into my hat of tricks honed from competitive programming, and pulled out "relabeling".

Right now, we are labeling all of the ends from $0$ to $2n-1$ at the start of the program. Recall that at each step, we either make a loop or we don't. Another way to phrase this is that we go from having $k$ strings to $k-1$ strings and $0$ or $1$ loops.

But notice that once we consume 2 ends, they never matter anymore. Poof! They are gone, never to be used at a future step. That's why we could get away with shuffling `end_seq`.

In the same vein, once a loop at a step is made, from the perspective of the remaining strings, it doesn't matter anymore either. A loop can't be used to make another loop, nor can it be used to make a longer string.

Another way to view this is that an end is either **part of a string** or **used-up**.

If an end `a` is **part of a string** it means that we have not encountered it in `end_seq` yet, and `end_map[a] = b; end_map[b] = a` holds. If an end is **used-up**, that means we have encountered it in `end_seq` and either it was a loop so `end_map[a] = b; end_map[b] = a` still holds, or `a` now points to something that does not ever point back to `a`. Crucially, after encountering `a` in `end_seq`, `a` is never referenced by a non-used-up end ever again.

So what if, after every step, we removed the used-up elements and relabeled every end from $0$ to (now) $2n-3$? At first, this seems like a step backward. Indeed, if we had to go through the `end_seq` and `end_map` vectors and relabel everything all over again, it take $O(n)$. And then we would have to shuffle `end_seq` again! 

...or would we?

## Making it trivial

We are using a shuffled `end_seq` because we need a random permutation of indices so that at each step we can select the next two indices from the list and perform the calculation. But now we are relabeling them at each step. So what we would do instead is at each step, generate a list of numbers from 0 to `n_ends`, shuffle it and pick the first two. 

That's choosing without replacement! 

So instead, we can generate 2 random numbers from 0 to `n_ends`, making sure they are not equal. And since we "relabeled" each string at each step, we know that a loop can only happen if we select numbers like $(0, 1)$, $(1,2)$, $(3,4)$, etc...

So the inner part of the function becomes:

```cpp
ul result = 0;
for (ul i = 0; i < n_ends; i += 2) {
  uniform_int_distribution<ul> distr(0, n_ends - 1 - i);

  const ul a = distr(rng);
  ul b = distr(rng);
  while (a == b) b = distr(rng);

  result += (a ^ 1) == b ? 1 : 0;
}
```

But let's take this relabelling idea one step further. Say we select one end. Only one other end completes a loop, and there are `n_ends - 1` other ends to choose from. So we just need to check if a random pick from those remaining ends happens to be the partner.

```cpp
ul result = 0;
for (ul i = 0; i < n_ends; i += 2) {
  uniform_int_distribution<ul> distr(0, (n_ends - 1) - i - 1);
  result += (distr(rng) == 0) ? 1 : 0;
}
```

But wait a second. Why are we generating this data? We're generating the data to get the expected value of the process. But looking at this `for` loop, we can calculate that directly. The result is $1$ with probability $\frac{1}{\texttt{n\_ends} - 1 - i}$ and $0$ otherwise. So the expected value of this iteration is exactly $\frac{1}{\texttt{n\_ends} - 1 - i}$.

And the expected value of a sum, is the sum of expected values. And we can actually flip that for loop. And hey loop overlapping sub-problems...

Oh no... I can feel the problem collapsing on a solution...

{% codefile "assets/posts/2026-05-random-ends/random-ends-v3.cpp", "cpp", 4, 17 %}

And update the python:

{% codefile "assets/posts/2026-05-random-ends/random-ends-v3.py", "python", 56, 64 %}

And bump up the simulation to 10000, why not.

```bash
--- Phase 1: Gather data max_n_strings=10000 ---
  Took 0.00 seconds.
--- Phase 2: Fit hypotheses ---
harmonic: 0.5013 * H(n) + 0.6814 (R²=1.0000)
log: 0.5000 * ln(n) + 0.9815 (R²=1.0000)
power: 0.8659 * n^0.2109 (R²=0.3192)
  Took 8.69 seconds.
--- Phase 3: Plot ---
  Saved to random-ends-v3.png

```

0.00 seconds. Now *that's* fast. And the plot:

<figure>
<img src="{{ '/assets/posts/2026-05-random-ends/random-ends-v3.png' | url }}">
<figcaption>10,000 string lengths with exact expected values, computed in under a millisecond.</figcaption>
</figure>

I removed the polynomial model as it was just wildly wrong at this point.

## Doing the math

Let's formalize what our code optimizations just discovered. Through relabeling, we reduced the simulation to this: at each step, there are $2n - i$ ends remaining (where $i$ steps by 2). We pick one end. Of the $2n - i - 1$ other ends, exactly one is its partner. So the probability of a loop is $\frac{1}{2n - i - 1}$, which is exactly the `distr(rng) == 0` check from our second-to-last reduction.

More formally: define $X_i$ as 1 if the $i$-th pairing creates a loop, 0 otherwise. By [linearity of expectation](https://en.wikipedia.org/wiki/Expected_value#Linearity):

$$\mathbb{E}[\text{total loops}] = \sum_{i=1}^{n} \mathbb{E}[X_i] = \sum_{i=1}^{n} P(\text{loop at step } i)$$

At step $i$, there are $2(n - i + 1)$ ends. We pick one, leaving $2(n - i + 1) - 1 = 2n - 2i + 1$ others. One is the partner:

$$P(\text{loop at step } i) = \frac{1}{2n - 2i + 1} = \frac{1}{2(n - i) + 1}$$

Substituting $k = n - i$:

$$\mathbb{E}[\text{total loops}] = \sum_{k=0}^{n-1} \frac{1}{2k+1} = \frac{1}{1} + \frac{1}{3} + \frac{1}{5} + \cdots + \frac{1}{2n-1}$$

The sum of odd reciprocals - which is exactly what `ev += 1.0 / (2*n_strings - 1)` computes in `random-ends-v3.cpp`. The code *was* the proof; we just didn't know it yet.

And *that's* why the harmonic model fit so well. The $n$-th [harmonic number](https://en.wikipedia.org/wiki/Harmonic_number) is $H_n = \sum_{k=1}^{n} \frac{1}{k}$, which can be split into even and odd terms. Our sum is the odd half-harmonic (split $H_{2n}$ into its odd and even terms, noting $\sum_{k=1}^{n} \frac{1}{2k} = \frac{1}{2}H_n$):

$$\sum_{k=1}^{n} \frac{1}{2k-1} = H_{2n} - \frac{1}{2}H_n \approx \frac{1}{2}H_n + \ln 2$$

Look familiar? That's exactly the `0.5013 * H(n) + 0.6814` from the fit — since $\ln 2 \approx 0.6931$.

And since $H_n \approx \ln(n) + \gamma$ (where $\gamma \approx 0.5772$ is the [Euler-Mascheroni constant](https://en.wikipedia.org/wiki/Euler%E2%80%93Mascheroni_constant)), we get that the expected number of loops grows like $\frac{1}{2}\ln(n)$. *That's* why the log model and the harmonic model had nearly identical $R^2$ values - they're basically the same thing up to constants! The [harmonic series](https://en.wikipedia.org/wiki/Harmonic_number) and $\ln$ are joined at the hip, and always have been.

For the $n = 50$ case, we can use Python's `Fraction` class to get the exact answer:

```python
from fractions import Fraction
n = 50
result = sum(Fraction(1, 2*k-1) for k in range(1, n+1))
print(f'~ {float(result):.10f}')
print(f'{result}')
```

```
~ 2.9377748485
3200355699626285671281379375916142064964/1089380862964257455695840764614254743075
```

Just shy of 3 loops.

## Conclusion

So why did I spend a weekend writing a C++ program with multithreading, adaptive sampling, and PyTorch curve fitting to solve a problem that has a two-line closed-form solution? I genuinely don't know. But I had a blast doing it.

I think there's something to be said for the "brute force it first, think later" approach. The simulation gave me intuition. The curve fitting told me what *shape* the answer had. And only then did the math click into place. Would I have seen the odd reciprocal sum staring at a blank page? Maybe. But probably not as fast as I did staring at a graph that was screaming "I'm a log, you idiot."

And hey, I got to write some C++ for the first time in a while. That alone was worth it.

---

**Source files:**
- [random-ends-v1.py]({{ '/assets/posts/2026-05-random-ends/random-ends-v1.py' | url }})
- [random-ends-v2.py]({{ '/assets/posts/2026-05-random-ends/random-ends-v2.py' | url }})
- [random-ends-v2.cpp]({{ '/assets/posts/2026-05-random-ends/random-ends-v2.cpp' | url }})
- [random-ends-v3.py]({{ '/assets/posts/2026-05-random-ends/random-ends-v3.py' | url }})
- [random-ends-v3.cpp]({{ '/assets/posts/2026-05-random-ends/random-ends-v3.cpp' | url }})
- [pyproject.toml]({{ '/assets/posts/2026-05-random-ends/pyproject.toml' | url }})
