# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versão: 0.1.0 · Última atualização: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Pacotes regionais de espécies para o VietAR: nomes, fotos e sons da fauna e flora locais.

Trade-free: sem rastreamento, sem anúncios, sem contas, funciona offline.

## Estado

Alfa: o repositório contém a estrutura, o esquema de dados ou os primeiros exemplos e os guias de contribuição. O âmbito abaixo é o plano, não o que funciona hoje.

## Âmbito previsto

- Uma especificação do formato de pacote: um manifesto `pack.json` com região, versão e número de espécies.
- Pacotes de espécies para a Roménia: cerca de 30 mamíferos dos Cárpatos com nomes em en/ro/hu/de, cerca de 50 aves comuns com ligações de áudio (Xeno-canto, CC-BY) e cerca de 40 plantas e cogumelos silvestres com um indicador `toxic`.
- Esqueletos de pacotes para a Bulgária e a Moldávia, com 20 espécies cada um.
- Um campo `look-alike` que liga pares de espécies perigosas.
- Ferramentas: um verificador de licenças de fotografias através da API da Wikimedia Commons, um otimizador de imagens (WebP, máximo de 640 px) e um guia para uma turma escolar adicionar um pacote local.

Nada disto está ainda implementado: cada ponto é uma tarefa preparada em `ISSUES_GOOD_FIRST.md`.

## Contribua em 5 minutos

1. Faça um fork deste repositório.
2. Copie `data/species/example.json` para `data/species/` e edite-o.
3. Execute `python scripts/validate.py`.
4. Abra um pull request — para dados não é preciso programar.

## Boas primeiras tarefas

Veja `ISSUES_GOOD_FIRST.md` para tarefas prontas.

## Licença

Código: MIT. Dados contribuídos: indique a fonte; são publicados sob a mesma licença, salvo indicação em contrário.

## Apoio

Se o projeto lhe for útil, pode [oferecer-me um café](https://buymeacoffee.com/echo.of.the.strings).
