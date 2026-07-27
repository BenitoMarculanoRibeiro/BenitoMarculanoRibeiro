import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSourceUrl,
  downloadSourceSvgs,
  escapeXml,
  extractMetric,
  fetchSvg,
  nestSvg,
  renderMetricPanel,
  validateStreakSvg,
  validateSvg,
  validateUsername,
} from "../scripts/update-github-trophies.mjs";

const safeSvg = `<svg xmlns="http://www.w3.org/2000/svg"><text>OK</text></svg>`;
const streakSvg = `<svg xmlns="http://www.w3.org/2000/svg">
  <!-- Total Contributions big number --><text>482</text>
  <!-- Current Streak big number --><text>4</text>
  <!-- Longest Streak big number --><text>13</text>
</svg>`;

test("valida nomes de usuário e rejeita entradas inválidas", () => {
  assert.doesNotThrow(() => validateUsername("BenitoMarculanoRibeiro"));
  assert.throws(() => validateUsername("../segredo"), /inválido/);
  assert.throws(() => validateUsername("-usuario"), /inválido/);
});

test("aceita somente origens HTTPS autorizadas", () => {
  const url = buildSourceUrl("https://streak-stats.demolab.com", {
    user: "BenitoMarculanoRibeiro",
  });
  assert.equal(url.protocol, "https:");
  assert.equal(url.searchParams.get("user"), "BenitoMarculanoRibeiro");
  assert.throws(
    () => buildSourceUrl("https://example.com", {}),
    /não permitida/,
  );
});

test("valida SVG seguro e completo", () => {
  assert.equal(validateSvg(safeSvg), true);
  assert.throws(() => validateSvg("<html>erro</html>"), /raiz SVG/);
  assert.throws(
    () => validateSvg("<svg><script>alert(1)</script></svg>"),
    /não permitido/,
  );
  assert.throws(
    () => validateSvg('<svg><image onload="alert(1)"/></svg>'),
    /não permitido/,
  );
  assert.throws(
    () => validateSvg('<svg><a href="javascript:alert(1)"/></svg>'),
    /não permitido/,
  );
});

test("repete falhas temporárias e retorna o SVG válido", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls < 3) {
      throw new Error("falha temporária");
    }
    return new Response(safeSvg, {
      status: 200,
      headers: { "content-type": "image/svg+xml" },
    });
  };

  const result = await fetchSvg(
    new URL("https://streak-stats.demolab.com"),
    {
      fetchImpl,
      attempts: 3,
      timeoutMs: 1_000,
      sleep: async () => {},
    },
  );

  assert.equal(result, safeSvg);
  assert.equal(calls, 3);
});

test("repete quando o serviço retorna um SVG de erro com HTTP 200", async () => {
  let calls = 0;
  const errorSvg =
    "<svg><text>Failed to retrieve contributions. This is likely a GitHub API issue.</text></svg>";
  const result = await fetchSvg(
    new URL("https://streak-stats.demolab.com"),
    {
      fetchImpl: async () => {
        calls += 1;
        return new Response(calls === 1 ? errorSvg : streakSvg, {
          status: 200,
          headers: { "content-type": "image/svg+xml" },
        });
      },
      attempts: 2,
      timeoutMs: 1_000,
      contentValidator: validateStreakSvg,
      sleep: async () => {},
    },
  );

  assert.equal(result, streakSvg);
  assert.equal(calls, 2);
});

test("preserva o artefato quando os serviços continuam indisponíveis", async () => {
  const warnings = [];
  const result = await downloadSourceSvgs(
    new URL("https://trophy.ryglcloud.net"),
    new URL("https://streak-stats.demolab.com"),
    {
      fetchSvgImpl: async () => {
        throw new Error("indisponível");
      },
      logger: { warn: (message) => warnings.push(message) },
    },
  );

  assert.equal(result, null);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /será preservado/);
});

test("interrompe depois do limite de tentativas", async () => {
  let calls = 0;
  await assert.rejects(
    fetchSvg(new URL("https://trophy.ryglcloud.net"), {
      fetchImpl: async () => {
        calls += 1;
        return new Response("indisponível", { status: 503 });
      },
      attempts: 2,
      timeoutMs: 1_000,
      sleep: async () => {},
    }),
    /após 2 tentativas/,
  );
  assert.equal(calls, 2);
});

test("rejeita resposta grande antes de ler seu conteúdo", async () => {
  await assert.rejects(
    fetchSvg(new URL("https://trophy.ryglcloud.net"), {
      fetchImpl: async () =>
        new Response(safeSvg, {
          headers: { "content-length": "1000001" },
        }),
      attempts: 1,
      timeoutMs: 1_000,
    }),
    /após 1 tentativas/,
  );
});

test("extrai somente uma métrica numérica esperada", () => {
  const svg =
    '<svg><!-- Current Streak big number --><text class="x">13</text></svg>';
  assert.equal(extractMetric(svg, "Current Streak big number"), "13");
  assert.throws(() => extractMetric(svg, "../marker"), /inválido/);
  assert.throws(
    () => extractMetric("<svg></svg>", "Longest Streak big number"),
    /não encontrada/,
  );
});

test("exige todas as métricas no SVG de contribuições", () => {
  assert.equal(validateStreakSvg(streakSvg), true);
  assert.throws(() => validateStreakSvg(safeSvg), /Métrica não encontrada/);
});

test("escapa textos ao gerar os painéis", () => {
  assert.equal(escapeXml('<&">'), "&lt;&amp;&quot;&gt;");
  const panel = renderMetricPanel(0, "A&B", "42", "<Total>", "#FF79C6");
  assert.match(panel, /A&amp;B/);
  assert.match(panel, /&lt;Total&gt;/);
  assert.throws(
    () => renderMetricPanel(0, "Teste", "<script>", "Total", "#FF79C6"),
    /métrica inválido/,
  );
});

test("insere posição apenas na raiz do SVG", () => {
  assert.match(nestSvg(safeSvg, 330), /^<svg x="330" y="0"/);
  assert.throws(() => nestSvg(safeSvg, -1), /Posição/);
});
