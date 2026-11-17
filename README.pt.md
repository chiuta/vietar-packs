# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versão: 0.2.0 · Última atualização: 2026-11-17

🌐 https://vietar-packs.chiuta.ro

> Pacotes regionais de espécies para o VietAR: nomes, fotos e sons da fauna e flora locais.

Trade-free: sem rastreamento, sem anúncios, sem contas, funciona offline.

## Estado

Alfa, utilizável: o único `index.html` explora, importa, verifica e cria pacotes regionais de espécies: nomes em vários idiomas, um indicador de toxicidade, sósias perigosos, fotos com licença e ligações a sons do xeno-canto. Inclui cinco pacotes de arranque integrados, com 71 espécies no total (Roménia: 19 plantas e fungos, 17 aves e 15 mamíferos; Bulgária e Moldávia: as mesmas 10 espécies comuns cada uma, como esqueletos). Cada pacote integrado é um rascunho ou um esqueleto: os nomes e as notas foram escritos com um assistente de IA e verificados só em parte, nenhum biólogo, micologista ou falante nativo os reviu, e ainda não têm fotos nem ligações a sons. A página não identifica nada e não é um guia de campo: a etiqueta «Não marcada como tóxica» nunca significa que seja seguro comer ou tocar. A aplicação VietAR ainda não consegue importar estes pacotes.

## O que faz

- «Explorar»: escolha um pacote, pesquise por um nome em qualquer língua ou pelo nome latino (maiúsculas e acentos não contam), filtre por grupo e por indicador de toxicidade, e abra uma espécie: os seus nomes (na língua da página, com o inglês como alternativa), o indicador e a nota de toxicidade, as notas, a fonte, as espécies com que é muitas vezes confundida (cada uma é uma ligação), as fotos e as ligações a sons. Uma caixa vermelha de segurança fica visível em todos os separadores e diz o que a página não é.
- «Pacotes»: os pacotes integrados e os que importar (cole o JSON ou escolha um ficheiro; no máximo 12 de cada vez), cada um com a sua região, versão, licença, autores, um distintivo de estado sincero («Esqueleto», «Rascunho», «Revisto») e o número de espécies por grupo; descarregue qualquer pacote ou remova os que importou. Um pacote é verificado por inteiro antes de ser adicionado: se algo estiver errado, nada é importado e vê o que corrigir.
- «Criar»: crie um pacote para uma turma, um clube de natureza ou uma região: preencha o pacote, adicione as espécies uma a uma (até 400), ligue os sósias nos dois sentidos, verifique o pacote com as mesmas regras do repositório e descarregue o ficheiro. O rascunho é guardado neste navegador enquanto trabalha. Um pacote feito aqui nunca pode ser marcado como revisto; as fotos e os sons acrescentam-se através do JSON da espécie.
- «Guia»: como usar a página e um exemplo de espécie com uma foto e um som.
- Formato: um ficheiro JSON por espécie em `data/species/`, um manifesto por pacote em `data/packs/`, montados em pacotes completos (formato `vietar-pack`) em `data/dist/`; descritos por `schema.json` e `pack.schema.json` e explicados em `docs/pack-format.md`.
- Ferramentas para quem contribui: `scripts/pack.mjs` (monta os pacotes e divide em ficheiros um pacote descarregado), `scripts/validate.py`, `scripts/optimize.py` (uma foto em WebP de 640 px no máximo, sem metadados), `scripts/check_licences.mjs` (licenças das fotos, online com `--online`). A interface está em oito línguas e funciona com o teclado e com um leitor de ecrã.
- Instalável como aplicação e disponível offline após a primeira visita quando servida por HTTPS (um service worker guarda a página; nada mais é guardado ou enviado). Aberta a partir de um ficheiro descarregado funciona da mesma forma, sem instalação.

## Como funciona

- Um ficheiro de espécie e um manifesto (a lista dos ids das espécies e o seu número) tornam-se um pacote completo: `node scripts/pack.mjs` escreve-o em `data/dist/<id>.json`. A página incorpora `data/dist/`, por isso o que explora é exatamente o que descarrega.
- `schema.json` e `pack.schema.json` descrevem os ficheiros; `scripts/validate.py` aplica-os, com as regras que um esquema não consegue dizer: o nome do ficheiro, o id e o nome latino coincidem, o grupo é compatível com o reino, as plantas e os fungos dizem se são tóxicos, uma espécie tóxica tem uma nota de toxicidade, os sósias apontam um para o outro, as fotos cabem em 3 MB, um pacote revisto indica o revisor e a data. `src/engine.mjs` aplica as mesmas regras na página; os testes comparam as duas.
- Segura por construção: o texto de um pacote é sempre mostrado como texto, nunca como HTML; as ligações só abrem endereços `https://`; a página não faz nenhum pedido de rede (as fotos vão incorporadas, os sons são ligações que abrem xeno-canto.org num novo separador); um pacote importado e o estado guardado são verificados de novo ao carregar a página, por isso um estado danificado ou hostil é recusado, não aceite como bom.
- `src/ui.js`, `src/i18n.mjs` e `src/app.css` são a interface; `scripts/build.mjs` constrói o único `index.html` a partir de `src/` e incorpora os pacotes de `data/dist/`; `node scripts/build.mjs --check` falha se a página estiver desatualizada.
- Testes: `npm test` (motor, paridade com o validador, scripts, verificador de licenças, otimizador de fotos, documentação) e testes de navegador no hub (oito línguas, acessibilidade, importações hostis, limites, armazenamento cheio). O desenvolvimento exige Node.js 24 ou mais recente e Python 3 com `jsonschema` (Pillow só para o otimizador de fotos); a própria página exige um navegador que conheça ES2017.
- `manifest.webmanifest`, `sw.js` e os ícones são produzidos por `node scripts/build.mjs` através do kit comum (secção `pwa` de `src/app.json`); `--check` também os verifica, e `npm test` confirma que o manifesto, a versão do service worker e a CSP correspondem à página.

## Limites sinceros

- Os pacotes incorporados são rascunhos: nomes e notas foram escritos com um assistente de IA a partir de conhecimentos gerais e verificados apenas em parte em páginas públicas. Nenhum biólogo, micologista ou falante nativo os reviu. Os pacotes da Bulgária e da Moldávia são esqueletos de 10 espécies cada.
- «Não marcada como tóxica» significa apenas que ninguém marcou a espécie como tóxica neste pacote. Nunca é a afirmação de que uma planta ou um cogumelo é comestível ou seguro, e os pacotes não ensinam a distinguir os sósias. Nunca coma uma planta ou um cogumelo silvestre por causa desta página.
- Os pacotes incorporados não contêm fotos nem ligações a sons, porque as licenças e os números das gravações não puderam ser verificados sem ligação à internet. O formato admite ambos, com autor, licença e fonte.
- Os pacotes importados aqui ficam guardados apenas neste navegador; limpar os dados do site elimina-os. Descarregue os que lhe interessam.
- A aplicação VietAR ainda não consegue importar estes pacotes. Por enquanto os pacotes são lidos e verificados nesta página e pelos scripts do repositório.
- As traduções da interface foram escritas por uma máquina e não foram revistas por falantes nativos. Os nomes e as notas das espécies aparecem na língua do pacote, com o inglês como alternativa.

## Contribua em 5 minutos

1. Faça um fork deste repositório.
2. Crie ou alargue um pacote: na página use o separador «Criar» e descarregue o ficheiro, ou escreva à mão ficheiros `data/species/<nome-latino>.json` (veja `docs/pack-format.md`).
3. Transforme um pacote descarregado em ficheiros com `node scripts/pack.mjs --split vietar-pack-<id>.json`, ou acrescente os ids das novas espécies ao manifesto do pacote em `data/packs/`.
4. Execute `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` e `node scripts/build.mjs`.
5. Abra um pull request — as contribuições de dados não exigem programar. Indique uma fonte para cada nome, nota e indicador de toxicidade, e nunca marque você mesmo um pacote como revisto (veja `docs/review-guide.md`).

## Boas primeiras tarefas

Veja `ISSUES_GOOD_FIRST.md` para tarefas prontas.

## Licença

Código: MIT. Dados: cada pacote indica a sua própria licença (CC0-1.0, CC-BY-4.0 ou CC-BY-SA-4.0); os pacotes integrados são CC0-1.0. As fotos e os sons mantêm as suas próprias licenças: cada um indica o autor, a licença e a fonte. Dados contribuídos: indique a fonte; são publicados sob a licença do pacote a que se juntam.

## Apoio

Se o projeto lhe for útil, pode [oferecer-me um café](https://buymeacoffee.com/echo.of.the.strings).
