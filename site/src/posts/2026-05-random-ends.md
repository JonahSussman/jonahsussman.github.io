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

{% codefile "assets/posts/2026-05-random-ends/random-ends-v1.py", "python", 179, 198 %}


And, in less than a second, out popped an image!

<figure>
<img src="{{ '/assets/posts/2026-05-random-ends/random-ends-v1.png' | url }}">
<figcaption>100 string lengths, 100 trials each.</figcaption>
</figure>

Good data! However, I'd like to have more trials per string length to tighten that CI. Additionally, I'd like to extend the graph out further to the right. Let's go to `run_trials_python(1000, 1000)` and see.

I ran the program and... 

```sh
--- Phase 1: Gather data ---
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
--- Phase 1: Gather data ---
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
<figcaption>10,000 string lengths with adaptive trials, completed in under a second.</figcaption>
</figure>

So obviously the polynomial approximation is right out. The power model also seems to drift. That leaves the harmonic model and the natural log model, both with suspiciously similar $R^2$ values. Suspicious enough to make you wonder if they're secretly the same thing...

## Doing the math

Alright, time to put on the big boy pants and actually solve this thing analytically.

Define a random variable $X_i$ that equals 1 if the $i$-th pairing creates a loop, and 0 otherwise. The total number of loops is just $X_1 + X_2 + \cdots + X_n$. By linearity of expectation (the single most overpowered tool in all of probability):

$$\mathbb{E}[\text{total loops}] = \mathbb{E}[X_1] + \mathbb{E}[X_2] + \cdots + \mathbb{E}[X_n]$$

Since $X_i$ is an indicator variable, $\mathbb{E}[X_i] = P(\text{loop at step } i)$. So what's the probability of forming a loop at step $i$?

At step $i$, there are $n - (i - 1) = n - i + 1$ strings remaining, and therefore $2(n - i + 1)$ ends. We pick one end. Now there are $2(n - i + 1) - 1 = 2n - 2i + 1$ ends left. Exactly *one* of those belongs to the same string as the end we just picked. So:

$$\mathbb{E}[X_i] = P(\text{loop at step } i) = \frac{1}{2n - 2i + 1} = \frac{1}{2(n - i) + 1}$$

Summing it all up:

$$\mathbb{E}[\text{total loops}] = \sum_{i=1}^{n} \frac{1}{2(n-i)+1}$$

Let $k = n - i$, so $i = n - k$. When $i = 1$, $k = n - 1$; when $i = n$, $k = 0$. Substituting:

$$\frac{1}{2(n - i) + 1} = \frac{1}{2(n - (n - k)) + 1} = \frac{1}{2k + 1}$$

So the sum becomes:

$$\sum_{k=0}^{n-1} \frac{1}{2k+1} = \frac{1}{1} + \frac{1}{3} + \frac{1}{5} + \cdots + \frac{1}{2n-1}$$

It's the sum of odd reciprocals! And *that's* why the harmonic model fit so well. The $n$-th harmonic number is $H_n = \sum_{k=1}^{n} \frac{1}{k}$, which can be split into even and odd terms. Our sum is the odd half-harmonic. In fact, you can show that:

$$\sum_{k=1}^{n} \frac{1}{2k-1} = H_{2n} - \frac{1}{2}H_n$$

And since $H_n \approx \ln(n) + \gamma$ (where $\gamma \approx 0.5772$ is the Euler-Mascheroni constant), we get:

$$H_{2n} - \frac{1}{2}H_n \approx \ln(2n) + \gamma - \frac{1}{2}(\ln(n) + \gamma) = \frac{1}{2}\ln(n) + \ln(2) + \frac{1}{2}\gamma$$

So asymptotically, the expected number of loops grows like $\frac{1}{2}\ln(n)$. *That's* why the log model and the harmonic model had nearly identical $R^2$ values - they're basically the same thing up to constants! The harmonic series and $\ln$ are joined at the hip, and always have been.

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
