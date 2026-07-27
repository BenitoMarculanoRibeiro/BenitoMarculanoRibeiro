import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const USERNAME = "BenitoMarculanoRibeiro";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const MAX_SVG_BYTES = 1_000_000;
const OUTPUT_PATH = "assets/github-trophies-pt-br.svg";
const ALLOWED_HOSTS = new Set([
  "trophy.ryglcloud.net",
  "streak-stats.demolab.com",
]);
const STREAK_METRIC_MARKERS = [
  "Total Contributions big number",
  "Current Streak big number",
  "Longest Streak big number",
];

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

export async function main() {
  validateUsername(USERNAME);

  const trophySource = buildSourceUrl("https://trophy.ryglcloud.net/", {
    username: USERNAME,
    theme: "dracula",
    "no-frame": "true",
    row: "1",
    column: "6",
  });
  const streakSource = buildSourceUrl("https://streak-stats.demolab.com", {
    user: USERNAME,
    theme: "dracula",
    locale: "pt_BR",
  });

  const sources = await downloadSourceSvgs(trophySource, streakSource);
  if (!sources) {
    return false;
  }
  const [rawTrophies, streakSvg] = sources;

  let trophiesSvg = rawTrophies;
  for (const [original, translated] of translations) {
    trophiesSvg = trophiesSvg.replaceAll(`>${original}<`, `>${translated}<`);
  }

  const totalContributions = extractMetric(
    streakSvg,
    "Total Contributions big number",
  );
  const currentStreak = extractMetric(streakSvg, "Current Streak big number");
  const longestStreak = extractMetric(streakSvg, "Longest Streak big number");
  const nestedTrophies = nestSvg(trophiesSvg, 330);

  const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="990" height="110" viewBox="0 0 990 110" fill="none">
  ${renderMetricPanel(0, "Contribuições", totalContributions, "Total", "#FF79C6")}
  ${renderMetricPanel(110, "Sequência atual", currentStreak, "Em andamento", "#79DAFA")}
  ${renderMetricPanel(220, "Maior sequência", longestStreak, "Recorde", "#FF79C6")}
  ${nestedTrophies}
</svg>`;

  validateSvg(combinedSvg, { source: "painel combinado" });
  await mkdir("assets", { recursive: true });
  await writeFile(OUTPUT_PATH, combinedSvg, { encoding: "utf8", flag: "w" });
  console.log("Painel de contribuições e troféus atualizado com sucesso.");
  return true;
}

export function validateUsername(username) {
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(username)) {
    throw new Error("Nome de usuário do GitHub inválido.");
  }
}

export function buildSourceUrl(source, parameters) {
  const url = new URL(source);
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error(`Origem externa não permitida: ${url.hostname}`);
  }
  url.search = new URLSearchParams(parameters).toString();
  return url;
}

export async function fetchSvg(
  url,
  {
    fetchImpl = globalThis.fetch,
    attempts = MAX_ATTEMPTS,
    timeoutMs = REQUEST_TIMEOUT_MS,
    contentValidator = validateSvg,
    sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  } = {},
) {
  if (!(url instanceof URL)) {
    throw new TypeError("A URL da requisição deve ser uma instância de URL.");
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error(`Origem externa não permitida: ${url.hostname}`);
  }
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 5) {
    throw new RangeError("O número de tentativas deve estar entre 1 e 5.");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 60_000) {
    throw new RangeError("O timeout deve estar entre 100 e 60000 ms.");
  }
  if (typeof contentValidator !== "function") {
    throw new TypeError("O validador de conteúdo deve ser uma função.");
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: {
          accept: "image/svg+xml",
          "user-agent": `${USERNAME}-profile-readme`,
        },
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > MAX_SVG_BYTES) {
        throw new Error("SVG excede o tamanho máximo permitido.");
      }

      const svg = await response.text();
      contentValidator(svg, { source: url.hostname });
      return svg;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(250 * 2 ** (attempt - 1));
      }
    }
  }

  throw new Error(
    `Falha ao baixar SVG de ${url.hostname} após ${attempts} tentativas.`,
    { cause: lastError },
  );
}

export async function downloadSourceSvgs(
  trophySource,
  streakSource,
  { fetchSvgImpl = fetchSvg, logger = console } = {},
) {
  try {
    return await Promise.all([
      fetchSvgImpl(trophySource),
      fetchSvgImpl(streakSource, { contentValidator: validateStreakSvg }),
    ]);
  } catch (error) {
    logger.warn(
      `Serviços externos indisponíveis; o SVG publicado será preservado. ${error.message}`,
    );
    return null;
  }
}

export function validateSvg(svg, { source = "desconhecida" } = {}) {
  if (typeof svg !== "string" || svg.trim() === "") {
    throw new Error(`SVG vazio ou inválido recebido de ${source}.`);
  }
  if (Buffer.byteLength(svg, "utf8") > MAX_SVG_BYTES) {
    throw new Error(`SVG de ${source} excede o tamanho máximo permitido.`);
  }

  const normalized = svg.trimStart().replace(/^<\?xml[^>]*>\s*/i, "");
  if (!/^<svg(?:\s|>)/i.test(normalized) || !/<\/svg>\s*$/i.test(normalized)) {
    throw new Error(`Conteúdo de ${source} não possui uma raiz SVG completa.`);
  }

  const forbiddenPatterns = [
    /<!DOCTYPE/i,
    /<!ENTITY/i,
    /<script\b/i,
    /<foreignObject\b/i,
    /\son[a-z]+\s*=/i,
    /(?:href|src)\s*=\s*["']?\s*javascript:/i,
    /(?:href|src)\s*=\s*["']?\s*data:text\/html/i,
  ];

  if (forbiddenPatterns.some((pattern) => pattern.test(svg))) {
    throw new Error(`SVG de ${source} contém conteúdo não permitido.`);
  }

  return true;
}

export function validateStreakSvg(svg, options) {
  validateSvg(svg, options);
  for (const marker of STREAK_METRIC_MARKERS) {
    extractMetric(svg, marker);
  }
  return true;
}

export function extractMetric(svg, marker) {
  if (!/^[A-Za-z ]{1,80}$/.test(marker)) {
    throw new Error("Marcador de métrica inválido.");
  }

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

export function nestSvg(svg, x) {
  if (!Number.isInteger(x) || x < 0 || x > 10_000) {
    throw new Error("Posição do SVG inválida.");
  }
  return svg.replace(/<svg\b/i, `<svg x="${x}" y="0"`);
}

export function escapeXml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
}

export function renderMetricPanel(x, title, value, subtitle, color) {
  if (!Number.isInteger(x) || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error("Configuração visual do painel inválida.");
  }
  if (!/^[\d.,]+$/.test(String(value))) {
    throw new Error("Valor de métrica inválido.");
  }

  return `<svg x="${x}" y="0" width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" rx="4.5" width="109" height="109" fill="#282A36"/>
    <text x="50%" y="18" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-weight="bold" font-size="12" fill="#FF79C6">${escapeXml(title)}</text>
    <text x="50%" y="68" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-weight="bold" font-size="30" fill="${color}">${escapeXml(value)}</text>
    <text x="50%" y="89" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-weight="bold" font-size="10.5" fill="#F8F8F2">${escapeXml(subtitle)}</text>
    <rect x="14" y="103" rx="1.5" width="82" height="3" fill="${color}" opacity="0.85"/>
  </svg>`;
}

const isDirectExecution =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  await main();
}
