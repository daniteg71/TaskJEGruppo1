// Costruisce il grafo del DNA (stile knowledge-base Obsidian).
// Nodi = "file" del Drive (Formulario, Bilanci, Visura, CV, Certificazioni, Aree).
// Archi = relazioni SEMANTICHE: ogni collegamento porta un significato.
//
// In live questa funzione legge l'elenco reale dei file dal Drive, quindi se il Drive
// viene modificato cambia anche il grafo. In mock sintetizza un set realistico dal DnaSnapshot.

import type { DnaSnapshot } from './types';

export type GraphNodeType =
  | 'core'
  | 'formulario'
  | 'bilancio'
  | 'visura'
  | 'cv'
  | 'certificazione'
  | 'area';

export type GraphNode = {
  id: string;
  label: string;
  type: GraphNodeType;
  /** peso visivo (raggio relativo) */
  weight: number;
};

export type GraphLink = {
  source: string;
  target: string;
  /** il significato del collegamento (mostrato all'hover) */
  meaning: string;
};

export type DnaGraph = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export function buildDnaGraph(dna: DnaSnapshot): DnaGraph {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const add = (n: GraphNode) => nodes.push(n);
  const link = (source: string, target: string, meaning: string) => links.push({ source, target, meaning });

  // Nodo centrale: il DNA stesso (renderizzato col gufo)
  add({ id: 'core', label: dna.visura.ragioneSociale, type: 'core', weight: 3 });

  // Visura -> core: identità giuridica
  add({ id: 'visura', label: 'Visura camerale', type: 'visura', weight: 1.6 });
  link('visura', 'core', 'Identità giuridica e requisiti di ammissibilità');

  // Formulario -> core, e Formulario -> ogni Area di interesse
  add({ id: 'formulario', label: 'Formulario servizi', type: 'formulario', weight: 2 });
  link('formulario', 'core', 'Mappa i servizi e i margini offerti');
  dna.formulario.areeCoperte.forEach((area, i) => {
    const id = `area-${i}`;
    add({ id, label: area, type: 'area', weight: 1.4 });
    link('formulario', id, 'Copre l\'area di competenza');
  });

  // Bilanci -> core: capacità economica
  dna.bilanci.anniDisponibili.forEach((anno) => {
    const id = `bilancio-${anno}`;
    add({ id, label: `Bilancio ${anno}`, type: 'bilancio', weight: 1.2 });
    link(id, 'core', 'Prova la capacità economico-finanziaria');
  });

  // CV -> core (competenza umana) e CV -> Aree (competenza tecnica per area)
  const ruoli = dna.cv.ruoliChiave;
  ruoli.forEach((ruolo, i) => {
    const id = `cv-${i}`;
    add({ id, label: `CV ${ruolo}`, type: 'cv', weight: 1.3 });
    link(id, 'core', 'Capacità tecnico-professionale del team');
    const areaId = `area-${i % Math.max(1, dna.formulario.areeCoperte.length)}`;
    if (nodes.some((n) => n.id === areaId)) link(id, areaId, 'Competenza tecnica sull\'area');
  });

  // Certificazioni -> CV: ogni certificazione qualifica una figura
  dna.cv.certificazioni.forEach((cert, i) => {
    const id = `cert-${i}`;
    add({ id, label: cert, type: 'certificazione', weight: 1 });
    const cvId = `cv-${i % Math.max(1, ruoli.length)}`;
    if (nodes.some((n) => n.id === cvId)) link(id, cvId, 'Qualifica/certifica la figura');
    else link(id, 'core', 'Qualifica certificata');
  });

  return { nodes, links };
}
