const form = document.getElementById("decision-form");
const results = document.getElementById("results");
const scoreEl = document.getElementById("score");
const scoreLabelEl = document.getElementById("score-label");
const pathEl = document.getElementById("path");
const stepsList = document.getElementById("steps-list");
const summaryList = document.getElementById("summary-list");
const profileSelect = document.getElementById("profile");

const factors = [
  { id: "money", label: "dinheiro" },
  { id: "time", label: "tempo" },
  { id: "impact", label: "impacto futuro" },
  { id: "risk", label: "risco" },
  { id: "benefit", label: "benefício" },
];

const profileWeights = {
  balanced: { money: 0.22, time: 0.18, impact: 0.26, risk: 0.14, benefit: 0.2 },
  conservative: { money: 0.26, time: 0.22, impact: 0.2, risk: 0.2, benefit: 0.12 },
  bold: { money: 0.16, time: 0.14, impact: 0.3, risk: 0.12, benefit: 0.28 },
};

const scoreLabels = [
  { min: 0, max: 39, text: "Arriscado agora" },
  { min: 40, max: 59, text: "Requer ajustes" },
  { min: 60, max: 79, text: "Boa oportunidade" },
  { min: 80, max: 100, text: "Altamente recomendável" },
];

const rangeInputs = factors.map((factor) => {
  const input = document.getElementById(factor.id);
  const valueEl = document.getElementById(`${factor.id}-value`);
  input.addEventListener("input", () => {
    valueEl.textContent = input.value;
  });
  return input;
});

const formatPercent = (value) => `${Math.round(value)}%`;

const calculateScore = (values, weights) => {
  const positive = values.benefit * weights.benefit;
  const impact = values.impact * weights.impact;
  const money = (10 - values.money) * weights.money;
  const time = (10 - values.time) * weights.time;
  const risk = (10 - values.risk) * weights.risk;

  const total = positive + impact + money + time + risk;
  return Math.round((total / 10) * 100);
};

const classifyPath = (score) => {
  if (score >= 75) return "Seguir em frente agora";
  if (score >= 55) return "Seguir, mas com ajustes";
  if (score >= 40) return "Adiar e preparar terreno";
  return "Evitar no momento";
};

const scoreLabel = (score) => {
  const item = scoreLabels.find((label) => score >= label.min && score <= label.max);
  return item ? item.text : "Análise inconclusiva";
};

const buildSteps = (question, values, score, profile) => {
  const steps = [];
  steps.push(`Pergunta analisada: “${question}”.`);
  steps.push(`Perfil aplicado: ${profile}.`);
  steps.push(
    `Benefício e impacto futuro somaram ${formatPercent(
      ((values.benefit + values.impact) / 20) * 100
    )} de influência positiva.`
  );
  steps.push(
    `Dinheiro e tempo foram avaliados como ${values.money}/10 e ${values.time}/10, então o esforço necessário é ${formatPercent(
      ((values.money + values.time) / 20) * 100
    )}.`
  );
  steps.push(
    `O risco ficou em ${values.risk}/10, reduzindo ${formatPercent(
      (values.risk / 10) * 100
    )} do potencial.`
  );
  steps.push(`Nota final calculada: ${score}/100.`);
  steps.push(`Caminho racional recomendado: ${classifyPath(score)}.`);
  return steps;
};

const buildSummary = (values, weights) =>
  factors.map((factor) => {
    const raw = values[factor.id];
    const weight = weights[factor.id];
    const adjusted =
      factor.id === "benefit" || factor.id === "impact" ? raw : 10 - raw;
    const contribution = Math.round((adjusted / 10) * weight * 100);
    return {
      ...factor,
      raw,
      weight,
      contribution,
    };
  });

const renderSummary = (summary) => {
  summaryList.innerHTML = "";
  summary.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "summary-item";

    const header = document.createElement("div");
    header.className = "summary-header";
    header.innerHTML = `<span>${item.label}</span><span>${item.raw}/10 · peso ${Math.round(
      item.weight * 100
    )}%</span>`;

    const bar = document.createElement("div");
    bar.className = "summary-bar";
    const fill = document.createElement("span");
    fill.style.width = `${item.contribution}%`;
    bar.appendChild(fill);

    wrapper.appendChild(header);
    wrapper.appendChild(bar);
    summaryList.appendChild(wrapper);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = document.getElementById("question").value.trim();

  const values = rangeInputs.reduce((acc, input) => {
    acc[input.id] = Number(input.value);
    return acc;
  }, {});

  const profile = profileSelect.value;
  const weights = profileWeights[profile];
  const score = calculateScore(values, weights);

  scoreEl.textContent = score;
  scoreLabelEl.textContent = scoreLabel(score);
  pathEl.textContent = `Caminho mais racional: ${classifyPath(score)}`;

  stepsList.innerHTML = "";
  buildSteps(
    question,
    values,
    score,
    profileSelect.options[profileSelect.selectedIndex].text
  ).forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    stepsList.appendChild(item);
  });

  renderSummary(buildSummary(values, weights));

  results.scrollIntoView({ behavior: "smooth", block: "start" });
});
