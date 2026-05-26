import io
import subprocess
import time
import random
import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from itertools import batched
from tqdm import tqdm

# --- Simulation logic ---

def perform(n_strings: int) -> int:
  all_ends: list[int] = list(range(2*n_strings))
  end_map: dict[int, int] = {}
  for a, b in batched(all_ends, 2):
    end_map[a] = b
    end_map[b] = a

  result = 0

  while len(all_ends) != 0:
    # Remove a random end from the list
    a = all_ends.pop(random.randrange(len(all_ends)))
    b = all_ends.pop(random.randrange(len(all_ends)))

    # Find the other corresponding end
    a_corresp = end_map[a]

    # If they belong to the same string, then increment result
    if a_corresp == b:
      result += 1
      continue

    b_corresp = end_map[b] # else, merge

    end_map[a_corresp] = b_corresp
    end_map[b_corresp] = a_corresp

  return result


def run_trials_python(
  max_n_strings: int,
  n_trials: int,
) -> pd.DataFrame:
  rows = []
  for n_strings in tqdm(range(1, max_n_strings + 1), desc="Gathering"):
    for _ in range(n_trials):
      rows.append({'x': n_strings, 'y': perform(n_strings)})

  return pd.DataFrame(rows)


def run_trials_cpp(
  max_n_strings: int,
  min_trials: int = 10,
  epsilon: float = 0.1,
  pre_alloc_trials: int = 1000,
) -> pd.DataFrame:
  result = subprocess.run(
    ['./random-ends-v2',
     str(max_n_strings), str(min_trials),
     str(epsilon), str(pre_alloc_trials)],
    stdout=subprocess.PIPE, stderr=None, text=True, check=True,
  )
  return pd.read_csv(io.StringIO(result.stdout))


# --- Hypothesis definitions ---

class HarmonicModel(torch.nn.Module):
  def __init__(self):
    super().__init__()
    self.a = torch.nn.Parameter(torch.tensor(1.0))
    self.b = torch.nn.Parameter(torch.tensor(0.0))
    self._H_cache: torch.Tensor | None = None  # Expensive!

  def forward(self, x: torch.Tensor) -> torch.Tensor:
    if self._H_cache is None or self._H_cache.shape != x.shape:
      self._H_cache = torch.tensor([
        sum(1.0/k for k in range(1, int(n)+1)) for n in x.numpy()
      ])
    return self.a * self._H_cache + self.b

  def pretty(self) -> str:
    return f"{self.a.item():.4f} * H(n) + {self.b.item():.4f}"

class LogModel(torch.nn.Module):
  def __init__(self):
    super().__init__()
    self.a = torch.nn.Parameter(torch.tensor(1.0))
    self.b = torch.nn.Parameter(torch.tensor(0.0))

  def forward(self, x: torch.Tensor) -> torch.Tensor:
    return self.a * torch.log(x) + self.b

  def pretty(self) -> str:
    return f"{self.a.item():.4f} * ln(n) + {self.b.item():.4f}"

class PowerModel(torch.nn.Module):
  def __init__(self):
    super().__init__()
    self.a = torch.nn.Parameter(torch.tensor(1.0))
    self.b = torch.nn.Parameter(torch.tensor(0.5))

  def forward(self, x: torch.Tensor) -> torch.Tensor:
    return self.a * x ** self.b

  def pretty(self) -> str:
    return f"{self.a.item():.4f} * n^{self.b.item():.4f}"

class PolynomialModel(torch.nn.Module):
  def __init__(self):
    super().__init__()
    self.a = torch.nn.Parameter(torch.tensor(0.01))
    self.b = torch.nn.Parameter(torch.tensor(0.1))
    self.c = torch.nn.Parameter(torch.tensor(0.0))

  def forward(self, x: torch.Tensor) -> torch.Tensor:
    return self.a * x**2 + self.b * x + self.c

  def pretty(self) -> str:
    return f"{self.a.item():.4f}n² + {self.b.item():.4f}n + {self.c.item():.4f}"

def fit_hypotheses(
    trials_df: pd.DataFrame,
    models: dict[str, torch.nn.Module],
    lr: float = 0.01,
    epochs: int = 5000,
) -> tuple[pd.DataFrame, pd.DataFrame]:
  plot_df = trials_df.groupby('x')['y'].agg(mean='mean', std='std', count='count').reset_index()
  plot_df['ci95'] = 1.96 * plot_df['std'] / np.sqrt(plot_df['count'])

  x = torch.tensor(plot_df['x'].values, dtype=torch.float32)
  y = torch.tensor(plot_df['mean'].values, dtype=torch.float32)

  meta_rows = []

  for name, model in tqdm(models.items(), desc="Fitting", total=len(models)):
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = torch.nn.MSELoss()

    for _ in range(epochs):
      optimizer.zero_grad()
      loss = loss_fn(model(x), y)
      loss.backward()
      optimizer.step()

    with torch.no_grad():
      fitted = model(x)
      ss_res = torch.sum((fitted - y) ** 2).item()
      ss_tot = torch.sum((y - y.mean()) ** 2).item()
      r2 = 1 - ss_res / ss_tot
      plot_df[name] = fitted.numpy()

    pretty = model.pretty()
    print(f"  {name}: {pretty} (R²={r2:.4f})")
    meta_rows.append({'name': name, 'pretty': pretty, 'r2': r2})

  meta_df = pd.DataFrame(meta_rows)
  return plot_df, meta_df


# --- Plotting function ---

def plot(
    plot_df: pd.DataFrame,
    meta_df: pd.DataFrame,
    filename: str,
) -> None:
  plt.figure(figsize=(10, 6))
  plt.plot(plot_df['x'], plot_df['mean'], label='mean', linewidth=2)
  plt.plot(plot_df['x'], plot_df['mean'] + plot_df['ci95'],
           linestyle='--', color='gray', alpha=0.5, label='95% CI')
  plt.plot(plot_df['x'], plot_df['mean'] - plot_df['ci95'],
           linestyle='--', color='gray', alpha=0.5)

  for _, row in meta_df.iterrows():
    label = f"{row['name']}: {row['pretty']} (R²={row['r2']:.4f})"
    plt.plot(plot_df['x'], plot_df[row['name']], label=label)

  plt.xlim(left=0)
  plt.ylim(bottom=0)
  plt.xlabel('n (number of strings)')
  plt.ylabel('E(n) (expected loops)')
  plt.legend()
  plt.tight_layout()
  plt.savefig(filename, dpi=150)
  plt.close()

# --- Main function ---

def main() -> None:
  max_n_strings = 1000

  print(f"--- Phase 1: Gather data {max_n_strings=} ---")
  start_time = time.time()
  trials_df = run_trials_cpp(max_n_strings)
  print(f"  Took {time.time() - start_time:.2f} seconds.")

  print("--- Phase 2: Fit hypotheses ---")
  start_time = time.time()
  models: dict[str, torch.nn.Module] = {
    'harmonic': HarmonicModel(),
    'log': LogModel(),
    'power': PowerModel(),
    'polynomial': PolynomialModel(),
  }
  plot_df, meta_df = fit_hypotheses(trials_df, models)
  print(f"  Took {time.time() - start_time:.2f} seconds.")

  print("--- Phase 3: Plot ---")
  plot(plot_df, meta_df, 'random-ends-v2.png')
  print("  Saved to random-ends-v2.png")


if __name__ == "__main__":
  main()
