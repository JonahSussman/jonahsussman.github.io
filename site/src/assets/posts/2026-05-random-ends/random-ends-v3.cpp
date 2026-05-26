// Build with:
// g++ random-ends-v3.cpp -O3 -o random-ends-v3

#include <cstdio>
#include <string>

typedef unsigned long ul;

int main(int argc, char** argv) {
  const ul max_n_strings = std::stoul(argv[1]);

  double ev = 0.0;
  for (ul n_strings = 1; n_strings <= max_n_strings; n_strings++) {
    ev += 1.0 / (2*n_strings - 1);          // Don't store anything for SPEED!
    fwrite(&ev, sizeof(double), 1, stdout); // Output raw doubles for SPEED!
  }
}
