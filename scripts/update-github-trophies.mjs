import { mkdir, writeFile } from "node:fs/promises";

const username = "BenitoMarculanoRibeiro";
const trophySource = new URL("https://trophy.ryglcloud.net/");
const streakSource = new URL("https://streak-stats.demolab.com");

trophySource.search = new URLSearchParams({
  username,
  theme: "dracula",
  "no-frame": "true",
  row: "1",
  column: "6",
}).toString();

streakSource.search = new URLSearchParams({
  user: username,
  theme: "dracula",
  locale: "pt_BR",
}).toString();

const translations = new Map([
  ["MultiLanguage", "Multilíngue"],
  ["Repositories", "Repositórios"],
  ["Experience", "Experiência"],
  ["Stars", "Estrelas"],
  ["Followers", "Seguidores"],
  ["Issues", "Issues"],
  ["PullRequest", "Pull Requests"],
  ["Reviews", "Revisões"],
  ["Unknown", "Desconhecido"],
  ["Rainbow Lang User", "Dev Poliglota"],
  ["God Repo Creator", "Mestre de Repos"],
  ["Deep Repo Creator", "Criador Experiente"],
  ["Super Repo Creator", "Super Criador"],
  ["Ultra Repo Creator", "Ultra Criador"],
  ["Hyper Repo Creator", "Hiper Criador"],
  ["High Repo Creator", "Criador Ativo"],
  ["Middle Repo Creator", "Criador Médio"],
  ["First Repository", "Primeiro Repo"],
  ["Seasoned Veteran", "Veterano Sênior"],
  ["Grandmaster", "Grão-Mestre"],
  ["Master Dev", "Dev Mestre"],
  ["Expert Dev", "Dev Especialista"],
  ["Experienced Dev", "Dev Experiente"],
  ["Intermediate Dev", "Dev Intermediário"],
  ["Junior Dev", "Dev Júnior"],
  ["Newbie", "Iniciante"],
  ["Super Stargazer", "Super Estrelado"],
  ["High Stargazer", "Muito Estrelado"],
  ["Stargazer", "Estrelado"],
  ["Super Star", "Superestrela"],
  ["High Star", "Estrela Alta"],
  ["You are a Star", "Você é Estrela"],
  ["Middle Star", "Estrela Média"],
  ["First Star", "Primeira Estrela"],
  ["God Committer", "Mestre dos Commits"],
  ["Deep Committer", "Committer Experiente"],
  ["Super Committer", "Super Committer"],
  ["Ultra Committer", "Ultra Committer"],
  ["Hyper Committer", "Hiper Committer"],
  ["High Committer", "Committer Ativo"],
  ["Middle Committer", "Committer Médio"],
  ["First Commit", "Primeiro Commit"],
  ["Super Celebrity", "Supercelebridade"],
  ["Ultra Celebrity", "Ultracélebre"],
  ["Hyper Celebrity", "Hipercélebre"],
  ["Famous User", "Usuário Famoso"],
  ["Active User", "Usuário Ativo"],
  ["Dynamic User", "Usuário Dinâmico"],
  ["Many Friends", "Muitos Seguidores"],
  ["First Friend", "Primeiro Seguidor"],
  ["God Issuer", "Mestre de Issues"],
  ["Deep Issuer", "Especialista em Issues"],
  ["Super Issuer", "Superautor de Issues"],
  ["Ultra Issuer", "Ultraautor de Issues"],
  ["Hyper Issuer", "Hiperautor de Issues"],
  ["High Issuer", "Autor Ativo"],
  ["Middle Issuer", "Autor Intermediário"],
  ["First Issue", "Primeira Issue"],
  ["God Puller", "Mestre de PRs"],
  ["Deep Puller", "Especialista em PRs"],
  ["Super Puller", "Superautor de PRs"],
  ["Ultra Puller", "Ultraautor de PRs"],
  ["Hyper Puller", "Hiperautor de PRs"],
  ["High Puller", "Autor Ativo de PRs"],
  ["Middle Puller", "Autor Interm. de PRs"],
  ["First Pull", "Primeiro PR"],
  ["God Reviewer", "Mestre das Revisões"],
  ["Deep Reviewer", "Revisor Experiente"],
  ["Super Reviewer", "Super Revisor"],
  ["Ultra Reviewer", "Ultra Revisor"],
  ["Hyper Reviewer", "Hiper Revisor"],
  ["Active Reviewer", "Revisor Ativo"],
  ["Intermediate Reviewer", "Revisor Intermediário"],
  ["New Reviewer", "Novo Revisor"],
]);

const requestOptions = {
  headers: { "user-agent": `${username}-profile-readme` },
};

const [trophyResponse, streakResponse] = await Promise.all([
  fetch(trophySource, requestOptions),
  fetch(streakSource, requestOptions),
]);

if (!trophyResponse.ok) {
  throw new Error(`Falha ao baixar os troféus: HTTP ${trophyResponse.status}`);
}

if (!streakResponse.ok) {
  throw new Error(`Falha ao baixar as contribuições: HTTP ${streakResponse.status}`);
}

let trophiesSvg = await trophyResponse.text();
const streakSvg = await streakResponse.text();

if (!trophiesSvg.includes("<svg") || !streakSvg.includes("<svg")) {
  throw new Error("Um dos serviços não retornou um SVG válido.");
}

for (const [original, translated] of translations) {
  trophiesSvg = trophiesSvg.replaceAll(`>${original}<`, `>${translated}<`);
}

const totalContributions = extractMetric(streakSvg, "Total Contributions big number");
const currentStreak = extractMetric(streakSvg, "Current Streak big number");
const longestStreak = extractMetric(streakSvg, "Longest Streak big number");

const nestedTrophies = trophiesSvg.replace("<svg", '<svg x="330" y="0"');

const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="990" height="110" viewBox="0 0 990 110" fill="none">
  ${renderMetricPanel(0, "Contribuições", totalContributions, "Total", "#FF79C6")}
  ${renderMetricPanel(110, "Sequência atual", currentStreak, "Em andamento", "#79DAFA")}
  ${renderMetricPanel(220, "Maior sequência", longestStreak, "Recorde", "#FF79C6")}
  ${nestedTrophies}
</svg>`;

await mkdir("assets", { recursive: true });
await writeFile("assets/github-trophies-pt-br.svg", combinedSvg, "utf8");

console.log("Painel de contribuições e troféus atualizado com sucesso.");

function extractMetric(svg, marker) {
  const markerPosition = svg.indexOf(`<!-- ${marker} -->`);

  if (markerPosition === -1) {
    throw new Error(`Métrica não encontrada: ${marker}`);
  }

  const section = svg.slice(markerPosition, markerPosition + 1_000);
  const match = section.match(/<text\b[^>]*>\s*([\d.,]+)\s*<\/text>/);

  if (!match) {
    throw new Error(`Valor inválido para a métrica: ${marker}`);
  }

  return match[1];
}

function renderMetricPanel(x, title, value, subtitle, color) {
  return `<svg x="${x}" y="0" width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" rx="4.5" width="109" height="109" fill="#282A36"/>
    <text x="50%" y="18" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-weight="bold" font-size="12" fill="#FF79C6">${title}</text>
    <text x="50%" y="68" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-weight="bold" font-size="30" fill="${color}">${value}</text>
    <text x="50%" y="89" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-weight="bold" font-size="10.5" fill="#F8F8F2">${subtitle}</text>
    <rect x="14" y="103" rx="1.5" width="82" height="3" fill="${color}" opacity="0.85"/>
  </svg>`;
}
