"use client";

import dynamic from "next/dynamic";

/** O canvas só existe no navegador: carrega depois da página, sem SSR. */
export const ClientCanvas = dynamic(() => import("./SharedCanvas"), { ssr: false });
