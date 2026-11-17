# Registo de alterações

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · **Português** · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Não lançado]

## [0.2.0] - 2026-11-17

### Adicionado
- A página: os separadores «Explorar», «Pacotes», «Criar» e «Guia» em oito línguas, com uma caixa vermelha de segurança sempre visível, atalhos de teclado e suporte para leitores de ecrã.
- O visualizador: pesquisa em qualquer língua (maiúsculas e acentos ignorados), filtros por grupo e por indicador de toxicidade, fichas de espécies com nomes, indicador e nota de toxicidade, notas, fonte, sósias (como ligações), fotos e ligações a sons; «Não marcada como tóxica» nunca aparece a verde e traz sempre um aviso.
- Pacotes: importação (colada ou de um ficheiro, verificada por inteiro antes de acrescentar o que quer que seja), descarga, remoção e substituição por id; número de espécies por grupo; distintivos de estado sinceros («Esqueleto», «Rascunho», «Revisto») com o significado de cada um.
- O criador: um formulário de pacote, um formulário de espécie com nomes em várias línguas, indicador e notas de toxicidade, sósias ligados nos dois sentidos, um editor de JSON para fotos e sons, uma verificação, uma descarga e um rascunho guardado no navegador (com um aviso quando o navegador fica sem espaço).
- O formato dos pacotes: `schema.json` (uma espécie), `pack.schema.json` (um manifesto), pacotes montados em `data/dist/` (formato `vietar-pack`, versão 1) e `data/dist/example.json` como exemplo de formato.
- Cinco pacotes de arranque integrados, com 71 espécies: Roménia (19 plantas e fungos, 17 aves, 15 mamíferos) e esqueletos para a Bulgária e a Moldávia (as mesmas 10 espécies cada um); rascunhos escritos com um assistente de IA e verificados só em parte, sem fotos nem ligações a sons.
- `scripts/pack.mjs` (montagem, `--check`, `--split`), `scripts/validate.py` (as mesmas regras da página, para cada ficheiro e cada pacote montado), `scripts/optimize.py` (fotos) e `scripts/check_licences.mjs` (licença e autor das fotos; `--online` consulta a Wikimedia Commons).
- Guias em inglês e romeno: `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` e `docs/review-guide.md`.
- `src/` e `scripts/build.mjs`: o único `index.html` é agora construído a partir das fontes, com os pacotes de `data/dist/` incorporados, e `--check` verifica-o.
- Testes: `npm test` e testes de navegador no hub.
- ISSUES_GOOD_FIRST e CODE_OF_CONDUCT traduzidos para as oito línguas.
- README em inglês, romeno, francês, italiano, espanhol, português, alemão e húngaro: secções de estado e de âmbito previsto (derivadas de `ISSUES_GOOD_FIRST.md`).
- Instalável (PWA): `manifest.webmanifest`, `sw.js` e os ícones são gerados pelo kit comum (`fff-kit/pwa`); a página funciona offline após a primeira visita por HTTPS.

### Alterado
- O workflow corre em Ubuntu 26.04 e Node.js 26, e executa a verificação dos pacotes, o validador, os testes e a verificação da construção.
- Os dados são agora um ficheiro por espécie e um manifesto por pacote (`data/species/`, `data/packs/`), montados em `data/dist/`; `data/species/example.json` é substituído por `data/dist/example.json`, e `scripts/validate.py`, os passos do README e os modelos mudaram em conformidade.
- A lista de «good first issues» contém agora o que ainda falta fazer (mais espécies, revisão por especialistas, fotos, sons, traduções); a especificação do formato, o campo de sósias, o otimizador de fotos, o verificador de licenças e o guia para turmas, que antes enumerava, existem.

## [0.1.0] - 2026-11-13

### Adicionado
- Esqueleto inicial: estrutura, esquema de dados ou primeiros exemplos, guias de contribuição em oito línguas.
