# Como contribuir — VietAR Packs

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · **Português** · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versão: 0.2.1 · Última atualização: 2026-11-20

1. Faça um fork deste repositório.
2. Crie ou alargue um pacote: na página use o separador «Criar» e descarregue o ficheiro, ou escreva à mão ficheiros `data/species/<nome-latino>.json` (veja `docs/pack-format.md`).
3. Transforme um pacote descarregado em ficheiros com `node scripts/pack.mjs --split vietar-pack-<id>.json`, ou acrescente os ids das novas espécies ao manifesto do pacote em `data/packs/`.
4. Execute `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` e `node scripts/build.mjs`.
5. Abra um pull request — as contribuições de dados não exigem programar. Indique uma fonte para cada nome, nota e indicador de toxicidade, e nunca marque você mesmo um pacote como revisto (veja `docs/review-guide.md`).

## Regras

- Uma espécie = um ficheiro em `data/species/`, com o nome do seu id (o nome latino em minúsculas com hífenes).
- Cite sempre uma fonte.
- Contribua apenas com material que possa partilhar legalmente (sem texto protegido copiado).
- Seja gentil: veja o Código de Conduta.

## Acrescentar espécies e pacotes

1. Parta de uma fonte que possa usar: os seus próprios conhecimentos e observações, ou páginas públicas cuja licença permita a reutilização (anote o endereço e a data). Não copie texto de guias de campo, aplicações ou sítios web, a menos que a licença o permita: escreva a nota com as suas palavras e diga-o em `source`.
2. Escreva um nome apenas numa língua que conheça ou que possa verificar com um falante nativo ou com um dicionário fiável. O inglês é obrigatório; a página mostra primeiro a língua de quem lê e o inglês como alternativa.
3. Em plantas e fungos `toxic` é obrigatório. Escreva `true` quando se sabe que alguma parte da espécie é venenosa, e escreva uma nota de toxicidade que diga qual é o perigo. `false` significa apenas que ninguém marcou aqui a espécie como tóxica: nunca significa comestível. Em caso de dúvida, pergunte a um especialista local antes de escrever `false`.
4. Registe um par perigoso de sósias nas duas espécies, com uma nota de aviso do género «As folhas podem ser confundidas; a confusão já causou intoxicações graves». Diga que se confundem, nunca como distingui-las: um conselho errado pode matar.
5. Fotos: suas, de domínio público ou com uma licença da lista de `docs/pack-format.md`, cada uma com o seu autor, a licença e uma ligação à fonte; reduza-as com `python3 scripts/optimize.py` (WebP, 640 px no máximo, sem dados de local) e verifique as fotos da Wikimedia Commons com `node scripts/check_licences.mjs --online`. Sons: apenas ligações a xeno-canto.org que tenha ouvido, com o autor da gravação e a licença.
6. Um pacote novo é um `draft` (ou um `skeleton` quando apenas mostra o formato). Só um revisor que tenha verificado cada espécie pode pôr `reviewed`, com o seu nome e a data: veja `docs/review-guide.md`.
7. Mais informação: `docs/contributor-guide.md` (comandos, ficheiros, verificações), `docs/school-class-guide.md` (uma turma ou um clube cria um pacote) e `docs/pack-format.md` (cada campo e limite).
