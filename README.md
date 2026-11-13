# DP Systems — Revista 3D interativa

Portfólio da DP Systems no formato de uma revista 3D: capa, editorial, três spreads de produto (DP Printer, EstoqueNTO, Credencial Studio) e contracapa com contato.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para conferir o build de produção: `npm run build`.

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Textos, links, integrações e dados da empresa | `src/content/site.ts` |
| Desenho de cada página da revista | `src/faces/*.ts` |
| Virada de página (ossos e curvatura) | `src/components/canvas/Sheet.tsx` |
| Armazém 3D e crachá holográfico | `src/components/canvas/Warehouse.tsx`, `Badge.tsx` |
| Câmera, luzes e zoom | `src/components/canvas/Scene.tsx` |
| Barra de navegação | `src/components/ui/Hud.tsx` |
| Versão em texto (SEO e acessibilidade) | `src/components/ui/ReadingMode.tsx` |

## Como funciona

- Cada folha é uma `SkinnedMesh` com 30 ossos, que curva ao virar.
- O conteúdo das páginas é desenhado em canvas 2D e aplicado como textura, então dobra junto com o papel.
- Os cliques chegam por raycast: a coordenada UV do ponto tocado vira uma posição na página (`src/lib/surface.ts`).
- O armazém e o crachá são objetos 3D reais que flutuam à frente da página aberta.
- A versão em texto usa o mesmo conteúdo e fica sempre no HTML.

## Controles

Setas, roda do mouse, arrasto lateral ou a barra inferior viram as páginas. `Z` ou duplo clique liga o zoom.

## Publicar

O projeto é um Next.js padrão: importe o repositório na Vercel ou rode `npx vercel` na pasta.
