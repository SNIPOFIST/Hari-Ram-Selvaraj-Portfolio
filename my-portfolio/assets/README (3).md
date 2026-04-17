# Bitcoin flash crash & market events — price + Reddit sentiment

**Predicting binary `flash_crash` events** from minute-level Bitcoin market features and time-aligned **Reddit sentiment** (VADER aggregates in the shipped training set; FinBERT scoring in separate pipelines).

---

## 30-second pitch (for recruiters)

| Question | Answer |
|----------|--------|
| **What did you build?** | A binary classifier for extreme downside (`flash_crash`) minutes using OHLCV-derived features plus per-subreddit VADER sentiment columns, trained as a **PyTorch sequence model** over 60-minute windows. |
| **What data?** | Minute BTC bars + engineered features (`train_vader.csv`, `test_common.csv`); Reddit posts/comments scored with **VADER** and **FinBERT** in notebooks; merged wide sentiment table (`Sentiment Scored/sentiment_scores_master.csv`). |
| **How?** | ETL and sentiment in `Data_Loading:preprocessing:scoring_sentiment:merging.ipynb` and `Sentiment Scored/Sentiment_Score_Crypto .ipynb`; modeling in `BTC_Vader.ipynb` (StandardScaler, sequences, early stopping). |
| **Result?** | On the held-out test split in the notebook (~56.8k samples after sequencing), **test accuracy ~0.71** with tuned probability threshold (e.g. 0.4); see **Evaluation metrics** below. |

---

## Problem statement

- **Goal:** Flag minutes where Bitcoin experiences a **flash crash** (or related sharp drawdown behavior encoded in `flash_crash`), using both **market microstructure / technical features** and **social sentiment** from crypto subreddits.
- **Why it matters:** Extreme moves create risk for traders and systems; early or interpretable signals from price + text can support monitoring, research, or downstream risk tools (not production trading advice).

---

## Dataset & sources

| Asset | Description |
|-------|-------------|
| **`train_vader.csv`** | Training rows: `minute`, OHLCV, rolling stats, drawdown/tier flags, horizon labels, **VADER** columns per subreddit + `vader_aggregate`, target **`flash_crash`**. |
| **`test_common.csv`** | Test rows: same schema for evaluation (paths used in `BTC_Vader.ipynb`). |
| **`train_finbert.csv`** | Parallel training table with **FinBERT**-style subreddit columns (for experiments comparing finance-tuned text features). |
| **`Sentiment Scored/sentiment_scores_master.csv`** | Wide time series: `rounded_time` × many subreddit sentiment score columns (FinBERT pipeline output for merging). |

**Raw Reddit** inputs are **not** committed here (large `.csv.gz` archives). Notebooks use **configurable paths** (local drive, Colab, or cloud); adjust paths before running.

---

## Project structure

```text
Bitcoin Flash Crash/
├── README.md
├── requirements.txt
├── train_vader.csv              # Training features + VADER + flash_crash
├── train_finbert.csv            # Training features + FinBERT columns
├── test_common.csv              # Test features + flash_crash
├── BTC_Vader.ipynb              # Sequence model, metrics, confusion matrix
├── Data_Loading:preprocessing:scoring_sentiment:merging.ipynb
│                                # ETL, VADER, FinBERT, merges (paths may need edits)
└── Sentiment Scored/
    ├── Sentiment_Score_Crypto .ipynb   # Colab-oriented FinBERT batch scoring
    └── sentiment_scores_master.csv     # Merged minute-level sentiment wide table
```

Optional: add an **`assets/`** folder with **screenshots** (confusion matrix, PR curve, sample EDA plots) and link them here.

---

## Tech stack

- **Python 3.10+** recommended  
- **pandas**, **NumPy** — tabular data  
- **PyTorch** — sequence classifier (`nn` + `DataLoader`)  
- **scikit-learn** — `StandardScaler`, metrics  
- **matplotlib** / **seaborn** — plots  
- **VADER** (`vaderSentiment`) — fast social sentiment  
- **Hugging Face Transformers** — **FinBERT** (`yiyanghkust/finbert-tone`) in sentiment notebooks  
- **tqdm** — long-running file loops  
- **Optional:** **RAPIDS cuML/cuPy** — some cells in the data notebook target GPU PCA (skip or run on CPU with sklearn alternatives)

---

## Setup

```bash
cd "Bitcoin Flash Crash"
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**PyTorch:** install the wheel that matches your OS/CUDA from [pytorch.org](https://pytorch.org) if the default `pip install torch` is not enough for your GPU setup.

---

## How to run

1. **Train / evaluate the sequence model (main result)**  
   - Open **`BTC_Vader.ipynb`**.  
   - Ensure **`train_vader.csv`** and **`test_common.csv`** sit in the notebook’s working directory (or update `read_csv` paths).  
   - Run all cells. Outputs include **accuracy**, **classification report**, and **confusion matrix** plots.

2. **Reproduce or extend ETL / sentiment**  
   - Open **`Data_Loading:preprocessing:scoring_sentiment:merging.ipynb`**.  
   - **Edit input/output paths** to where your Reddit `.csv.gz` and price files live.  
   - Some sections assume **cloud or GPU**; run sklearn-only paths if you skip cuML.

3. **FinBERT scoring at scale (Colab / local)**  
   - Use **`Sentiment Scored/Sentiment_Score_Crypto .ipynb`**.  
   - Mount storage or set `input_folder` to your Reddit zip/csv directory; outputs feed **`sentiment_scores_master.csv`**-style merges.

---

## EDA summary (high level)

- **Granularity:** one row per **minute** (aligned timestamps for merge with sentiment).  
- **Price / market features** include OHLCV, rolling volume/volatility, drawdowns, momentum, tier flags, and multi-horizon labels (some dropped before modeling in `BTC_Vader.ipynb`).  
- **Sentiment:** sparse by minute; many zeros when no posts map to a given minute/subreddit.  
- **Class balance:** **`flash_crash` is rare** vs normal minutes; the notebook uses **thresholding** on predicted probabilities to trade precision/recall.  
- **Detail:** run grouping/EDA cells in the data notebook on your machine for fresh plots.

---

## Modeling approach

1. **Features:** All numeric columns except `minute`, dropped label columns (`label_t1_L5_H15`, `label_t2_L10_H30`, `label_t3_L60_H240`), and target **`flash_crash`**.  
2. **Scaling:** `StandardScaler` fit on train, applied to test.  
3. **Sequences:** Sliding windows of length **60** minutes → tensor input for a **PyTorch** model.  
4. **Training:** Batched training with **validation** and **early stopping** on validation loss.  
5. **Inference:** Sigmoid probabilities → binary predictions via a chosen threshold (notebook experiments include **0.3** and **0.4**).

---

## Evaluation metrics

Reported on the **test** split in `BTC_Vader.ipynb` (after sequence construction, **n ≈ 56,792** samples in the saved run):

| Setting | Test accuracy | Notes |
|---------|----------------|--------|
| Threshold **0.3** | **0.6756** | Higher recall on class `0.0`, slightly different precision/recall tradeoff |
| Threshold **0.4** | **0.7095** | Example: class `1.0` F1 ≈ **0.74**, class `0.0` F1 ≈ **0.67** (see notebook for full report) |

Always cite **precision/recall/F1 per class** for imbalanced problems—not accuracy alone.

---

## Sample output

After running `BTC_Vader.ipynb`, expect console output similar to:

```text
✅ Final Batched Test Accuracy: 0.7095

              precision    recall  f1-score   support

         0.0     0.6076    0.7436    0.6688     22400
         1.0     0.8045    0.6873    0.7413     34392

    accuracy                         0.7095     56792
```

Plus **confusion matrix** heatmaps in the notebook. Add exported images under `assets/` if you want them in GitHub’s README preview.

---

## Business impact & takeaways

- **Monitoring / research:** Models like this can prioritize **minutes worth human review** when price action and sentiment jointly look unusual—useful for risk dashboards or post-mortems, not as a sole trading signal.  
- **Data fusion:** Shows how **alternative data** (Reddit) can be aligned to **high-frequency bars**; sparsity and lag limit signal quality.  
- **Honest limitation:** Rare events and **class imbalance** inflate naive accuracy; production use would need **calibration**, **cost-sensitive thresholds**, and **regime-aware** validation.

---

## Conclusion & recommendations

- The repo delivers a **credible baseline**: sequence model on **VADER-enriched** minute features with documented **test metrics**.  
- **Next steps:** (1) Train the same architecture on **`train_finbert.csv`** and compare to VADER. (2) Add **PR-AUC** and **balanced accuracy**. (3) Try **class weights** or **focal loss**. (4) Commit **EDA figures** and **confusion matrix** PNGs under `assets/` for a one-glance portfolio view.

---

## License / use

Academic and portfolio use. Market and social data remain subject to their **original sources’ terms**; do not redistribute raw Reddit dumps unless permitted.
