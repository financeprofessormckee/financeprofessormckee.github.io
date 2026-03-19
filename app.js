const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtPct = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 2 });

const els = {
  contrib: document.getElementById('contrib'),
  years: document.getElementById('years'),
  incomeRate: document.getElementById('incomeRate'),

  contribVal: document.getElementById('contribVal'),
  yearsVal: document.getElementById('yearsVal'),
  peopleVal: document.getElementById('peopleVal'),

  fv: document.getElementById('fv'),
  incomePer: document.getElementById('incomePer'),
  summary: document.getElementById('summary'),
  copy: document.getElementById('copy'),
};

function futureValueAnnual(pmtAnnual, annualRate, years) {
  const r = annualRate;
  const n = years;
  if (r === 0) return pmtAnnual * n;
  //ordinary annuity with contributions at the end of each year
  return pmtAnnual * ((Math.pow(1 + r, n) - 1) / r);
}

function balanceSeriesByYear(pmtAnnual, annualRate, years) {
  const r = annualRate;
  let bal = 0;
  const points = [];
  for (let y = 1; y <= years; y++) {
    //grow for the year and then add the contribution (ordinary annuity)
    bal = bal * (1 + r) + pmtAnnual;
    points.push({ year: y, bal });
  }
  return points;
}

let chart;
function initChart() {
  const ctx = document.getElementById('chart');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{ label: 'Balance', data: [], borderWidth: 2, tension: 0.2 }]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: (v) => fmtUSD.format(v) } }
      }
    }
  });
}

function render() {
  const pmt = Number(els.contrib.value);
  const years = Number(els.years.value);
  const incomeRate = Number(els.incomeRate.value) / 100;
  const saveRate = incomeRate;
  const people = 6;

  els.contribVal.textContent = fmtUSD.format(pmt) + "per year";
  els.yearsVal.textContent = years;
  els.peopleVal.textContent = people;

  const fv = futureValueAnnual(pmt, saveRate, years);
  const incomeAnnualTotal = fv * incomeRate;           // perpetuity-style
  const incomePer = incomeAnnualTotal / people;

  els.fv.textContent = fmtUSD.format(fv);
  els.incomePer.textContent = fmtUSD.format(incomePer) + " / year";

  const series = balanceSeriesByYear(pmt, saveRate, years);
  chart.data.labels = series.map(p => `Year ${p.year}`);
  chart.data.datasets[0].data = series.map(p => p.bal);
  chart.update();

  const summaryText =
`Inputs:
- Contribution: ${fmtUSD.format(pmt)}/year
- Years: ${years}
- Saving return: ${(saveRate*100).toFixed(1)}%
- Income rate: ${(incomeRate*100).toFixed(1)}%
- People: ${people}

Outputs:
- Future value: ${fmtUSD.format(fv)}
- Annual income per person: ${fmtUSD.format(incomePer)}`;
  els.summary.textContent = summaryText;
}

function wire() {
  [els.contrib, els.years, els.incomeRate].forEach(el => {
    el.addEventListener('input', render);
  });

  els.copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(els.summary.textContent);
  });
}

initChart();
wire();
render();