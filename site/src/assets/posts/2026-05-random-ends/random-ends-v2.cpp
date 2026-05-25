// Build with:
// g++ random-ends-v2.cpp -O3 -pthread -o random-ends-v2

#include <bits/stdc++.h>

using namespace std; // Evil!
typedef unsigned long ul;

void perform_adaptive(
  vector<pair<ul, ul>>& results, // Elements are { # strings, # loops made }
  atomic<ul>& next_n_strings,    // Atomic to grab next string size to calc
  const ul max_n_strings,        // Largest number of strings to calc
  const ul min_trials,           // Min trials before kicking in standard error
  const double epsilon           // Standard error to target
) {
  mt19937 rng(random_device{}());
  const ul max_n_ends = 2*max_n_strings;

  auto end_seq = vector<ul>(max_n_ends); // Pre-allocate based on maximum ends
  auto end_map = vector<ul>(max_n_ends); // we could possibly need.

  for (ul i = 0; i < max_n_ends; i++) // n_strings only increases, so we set
    end_seq[i] = i;                   // end_seq only once.

  ul n_strings;
  while ((n_strings = next_n_strings.fetch_add(1)) <= max_n_strings) {
    const ul n_ends = 2*n_strings;

    ul sum = 0, sum_sq = 0, n = 0; // Stats for standard error stopping
    while (true) {
      // While we don't need to reset end_seq, we do need to reset end_map
      for (ul i = 0; i < n_ends; i += 2) {
        end_map[i]   = i+1; // Could do `end_map[i] = i^1;` with `i++`, but the
        end_map[i+1] = i;   // compiler optimizes it the same way
      }

      shuffle(end_seq.begin(), end_seq.begin() + n_ends, rng);

      ul result = 1; // Always at least 1 loop, so no need to calc last string
      for (ul i = 0; i < n_ends - 2; i += 2) {
        const ul a = end_seq[i];
        const ul b = end_seq[i+1];

        const ul a_other = end_map[a];
        if (a_other == b) {
          result++;
          continue;
        }

        const ul b_other = end_map[b];

        end_map[a_other] = b_other;
        end_map[b_other] = a_other;
      }

      results.push_back({n_strings, result});

      sum    += result;
      sum_sq += result * result;
      n++;
      if (n >= min_trials) {
        double var = ((double)sum_sq - (double)sum * sum / n) / (n - 1);
        double se = sqrt(var / n);
        if (se <= epsilon / 1.96) break; // 95% CI
      }
    }
  }
}

int main(int argc, char** argv) {
  ios_base::sync_with_stdio(false); // Competitive programming stuff to make
  cin.tie(nullptr);                 // cout faster

  const ul max_n_strings    = stoul(argv[1]);
  const ul min_trials       = stoul(argv[2]);
  const double epsilon      = stod(argv[3]);
  const ul pre_alloc_trials = stoul(argv[4]);

  const ul n_threads = thread::hardware_concurrency() ?: 4;

  atomic<ul> next_n_strings(1);
  vector<thread> threads;

  vector<vector<pair<ul, ul>>> thread_results(n_threads);
  for (auto& v : thread_results)                   // Pre-alloc result arrays
      v.reserve(max_n_strings * pre_alloc_trials); // for performance

  for (ul t = 0; t < n_threads; t++)
    threads.emplace_back(
      perform_adaptive, ref(thread_results[t]), ref(next_n_strings),
      max_n_strings, min_trials, epsilon);

  for (auto& t : threads) t.join();

  cout << "x,y\n"; // Output CSV to stdout
  for (auto& tr : thread_results)
    for (auto& [x, y] : tr)
      cout << x << "," << y << "\n";

  return 0;
}
