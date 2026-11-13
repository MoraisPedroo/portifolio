# DP Systems — site institucional

Site de uma página, em rolagem contínua, que apresenta a DP Systems e seus três produtos: DP Printer, EstoqueNTO e Credencial Studio. Dois momentos são 3D e interativos: o armazém do EstoqueNTO e o crachá holográfico do Credencial Studio.

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
| Cores e tipografia | `src/app/globals.css` (bloco `@theme`) e `src/lib/fonts.ts` |
| Abertura com a impressora de etiquetas | `src/components/Hero.tsx`, `LabelPrinter.tsx` |
| DP Printer (simulador e diagrama) | `src/components/dpprinter/` |
| EstoqueNTO (armazém e integrações) | `src/components/estoquento/`, `src/three/WarehouseScene.tsx` |
| Credencial Studio (editor e crachá) | `src/components/credencial/`, `src/three/BadgeScene.tsx`, `src/three/badgeFaces.ts` |
| Estado das demonstrações | `src/store/useDemo.ts` |
| Fotos dos produtos | `public/images/` |

## Como funciona

- Todo texto é HTML de verdade: legível no celular, indexável e acessível.
- Um único canvas WebGL fixo (`src/three/SharedCanvas.tsx`) desenha os dois palcos 3D com o `<View>` do drei; cada palco é um elemento comum da página e só é renderizado quando está na tela.
- O crachá usa um shader próprio (película fina, Fresnel e flocos metálicos) sobre uma textura desenhada em canvas 2D, que atualiza enquanto a pessoa digita.
- Se o FPS cair, o `PerformanceMonitor` reduz a resolução do canvas.
- Com "reduzir movimento" ativo no sistema, as animações param e o conteúdo continua visível.

## Paleta

| Token | Cor | Uso |
| --- | --- | --- |
| `ink` | `#0E1116` | Faixas escuras e palcos 3D |
| `paper` | `#F3F5F7` | Faixas claras |
| `dp` | `#10B981` | DP Printer e marca |
| `nto` | `#F26A1B` | EstoqueNTO |
| `cred` | `#9B7BFF` | Credencial Studio |

Texto de acento sobre fundo claro usa as variantes `-deep` para manter contraste AA.

## Skills do Claude Code

Em `.claude/skills/` estão as skills usadas no projeto: `frontend-design` (Anthropic), `web-design-guidelines` e `react-best-practices` (Vercel) e `threejs-react-three-fiber` (CloudAI-X).

## Publicar

O projeto é publicado na Vercel a partir da branch `main` do GitHub: cada push gera um novo deploy.
