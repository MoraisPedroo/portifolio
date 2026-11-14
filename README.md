# DP Systems — site institucional

Site de uma página que apresenta a DP Systems e seus três produtos: DP Printer, EstoqueNTO e Credencial Studio. No desktop cada seção ocupa exatamente uma tela e a rolagem para em cada uma. Três momentos são 3D e interativos: a revista com os produtos na abertura, o armazém do EstoqueNTO e o crachá holográfico do Credencial Studio.

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
| Abertura com a revista 3D | `src/components/Hero.tsx`, `HeroMagazine.tsx`, `src/three/magazine/` |
| Páginas da revista | `src/three/magazine/pages.ts` |
| Altura de tela e espaçamentos das seções | `src/components/Section.tsx` |
| DP Printer (simulador e diagrama) | `src/components/dpprinter/` |
| EstoqueNTO (integrações) | `src/components/estoquento/` |
| Sala 3D do EstoqueNTO (demonstração, sem login) | `public/sala3d/` (`demo.js`, `data.js`) |
| Credencial Studio (editor e crachá) | `src/components/credencial/`, `src/three/BadgeScene.tsx`, `src/three/badgeFaces.ts` |
| Estado das demonstrações | `src/store/useDemo.ts` |
| Logo, fotos e ícone | `public/images/`, `src/app/icon.png` |

## Como funciona

- Todo texto é HTML de verdade: legível no celular, indexável e acessível.
- Um canvas WebGL fixo (`src/three/SharedCanvas.tsx`) desenha a revista e o crachá com o `<View>` do drei; cada palco é um elemento comum da página e só é renderizado quando está na tela.
- A sala 3D do EstoqueNTO vem do repositório do EstoqueNTO (`sala3d`), em modo demonstração: sem Firebase, sem login e só com códigos ilustrativos. Ela roda num iframe e pausa quando sai da tela.
- A revista abre 5 s depois de aparecer e vira uma página a cada 10 s (`src/components/HeroMagazine.tsx`).
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
