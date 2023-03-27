import { parse } from "tldts"

import type { ScraperInterface } from "./base.server"
import createScraperFactory, { BaseScraper } from "./base.server"
// Stores
import {
  AmazonScraper,
  BabylistScraper,
  BebeMundoScraper,
  BuybuyBaby,
  CasaCoolScraper,
  CasaCuestaScraper,
  CabuyaScraper,
  CorripioScraper,
  ElectrodomesticosComDo,
  ElEstudioStoreScraper,
  HifiScraper,
  IkeaScraper,
  IlumelOutletScraper,
  IlumelScraper,
  JumboScraper,
  LaNoviaDeVillaScraper,
  LeTavoleScraper,
  PandarettaScraper,
  PlazaLamaScraper,
  PotteryBarnKidsScraper,
  PricesmartScraper,
  SirenaScraper,
  TwinkleRDScraper,
  ZaraHomeScraper,
  WayfairScraper,
} from "./stores"

export default async function createScraper(
  url: URL
): Promise<ScraperInterface> {
  const { domain } = parse(url.hostname)

  const scraperFactory = createScraperFactory(url)

  const AvailableStores = {
    [AmazonScraper.domain]: AmazonScraper,
    [BabylistScraper.domain]: BabylistScraper,
    [BebeMundoScraper.domain]: BebeMundoScraper,
    [BuybuyBaby.domain]: BuybuyBaby,
    [CabuyaScraper.domain]: CabuyaScraper,
    [CasaCoolScraper.domain]: CasaCoolScraper,
    [CasaCuestaScraper.domain]: CasaCuestaScraper,
    [CorripioScraper.domain]: CorripioScraper,
    [ElectrodomesticosComDo.domain]: ElectrodomesticosComDo,
    [ElEstudioStoreScraper.domain]: ElEstudioStoreScraper,
    [HifiScraper.domain]: HifiScraper,
    [IkeaScraper.domain]: IkeaScraper,
    [IlumelOutletScraper.domain]: IlumelOutletScraper,
    [IlumelScraper.domain]: IlumelScraper,
    [JumboScraper.domain]: JumboScraper,
    [LaNoviaDeVillaScraper.domain]: LaNoviaDeVillaScraper,
    [LeTavoleScraper.domain]: LeTavoleScraper,
    [PandarettaScraper.domain]: PandarettaScraper,
    [PlazaLamaScraper.domain]: PlazaLamaScraper,
    [PotteryBarnKidsScraper.domain]: PotteryBarnKidsScraper,
    [PricesmartScraper.domain]: PricesmartScraper,
    [SirenaScraper.domain]: SirenaScraper,
    [TwinkleRDScraper.domain]: TwinkleRDScraper,
    [WayfairScraper.domain]: WayfairScraper,
    [ZaraHomeScraper.domain]: ZaraHomeScraper,
  } as const

  const store = Object.keys(AvailableStores).find(
    (storeDomain) => storeDomain === domain
  )

  const storeScraper = store
    ? // If store is not found, use default scraper
      AvailableStores[store] || BaseScraper
    : BaseScraper

  return scraperFactory(storeScraper)
}
