import { parse } from "tldts"

// Stores
import {
  AmazonScraper,
  BabylistScraper,
  BebeMundoScraper,
  BuybuyBaby,
  CasaCoolScraper,
  CasaCuestaScraper,
  CorripioScraper,
  ElectrodomesticosComDo,
  ElEstudioStoreScraper,
  HifiScraper,
  IkeaScraper,
  IlumelOutletScraper,
  IlumelScraper,
  LaNoviaDeVillaScraper,
  LeTavoleScraper,
  PandarettaScraper,
  PlazaLamaScraper,
  PricesmartScraper,
  SirenaScraper,
  ZaraHomeScraper,
} from "./stores"
import type { ScraperInterface } from "./stores/base"
import createScraperFactory, { BaseScraper } from "./stores/base"

export default async function createScraper(
  url: URL
): Promise<ScraperInterface> {
  const { domain } = parse(url.hostname)

  const scraperFactory = createScraperFactory(url)

  const availableStores = {
    [AmazonScraper.domain]: AmazonScraper,
    [BabylistScraper.domain]: BabylistScraper,
    [BebeMundoScraper.domain]: BebeMundoScraper,
    [BuybuyBaby.domain]: BuybuyBaby,
    [CasaCoolScraper.domain]: CasaCoolScraper,
    [CasaCuestaScraper.domain]: CasaCuestaScraper,
    [CorripioScraper.domain]: CorripioScraper,
    [ElectrodomesticosComDo.domain]: ElectrodomesticosComDo,
    [ElEstudioStoreScraper.domain]: ElEstudioStoreScraper,
    [HifiScraper.domain]: HifiScraper,
    [IkeaScraper.domain]: IkeaScraper,
    [IlumelOutletScraper.domain]: IlumelOutletScraper,
    [IlumelScraper.domain]: IlumelScraper,
    [LaNoviaDeVillaScraper.domain]: LaNoviaDeVillaScraper,
    [LeTavoleScraper.domain]: LeTavoleScraper,
    [PandarettaScraper.domain]: PandarettaScraper,
    [PlazaLamaScraper.domain]: PlazaLamaScraper,
    [PricesmartScraper.domain]: PricesmartScraper,
    [SirenaScraper.domain]: SirenaScraper,
    [ZaraHomeScraper.domain]: ZaraHomeScraper,
  } as const

  const store = Object.keys(availableStores).find(
    (storeDomain) => storeDomain === domain
  )

  const storeScraper = store
    ? // If store is not found, use default scraper
      availableStores[store] || BaseScraper
    : BaseScraper

  return scraperFactory(storeScraper)
}
