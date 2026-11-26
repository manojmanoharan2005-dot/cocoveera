/**
 * File: frontend/src/App.jsx
 * Purpose: Main React application component defining routing structure.
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import axios from 'axios';
import { API_URL } from './utils/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/common/ErrorBoundary';

// Configure QueryClient with the optimized performance settings requested
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes stale time
      cacheTime: 15 * 60 * 1000,     // 15 minutes cache time
      refetchOnWindowFocus: false,   // Disable refetching on window focus
      keepPreviousData: true,        // Show cached data while loading new
    },
  },
});

import { lazyWithRetry } from './utils/lazyWithRetry';

// Prefetching removed for optimization
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
const QualityTesting = lazyWithRetry(() => import('./pages/QualityTesting'), 'QualityTesting');
const CoconutSubstrates = lazyWithRetry(() => import('./pages/CoconutSubstrates'), 'CoconutSubstrates');
import Contact from './pages/Contact';
const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound');
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'), 'PrivacyPolicy');
const TermsConditions = lazyWithRetry(() => import('./pages/TermsConditions'), 'TermsConditions');
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'), 'Onboarding');

// Landing Pages
const BlueberryDiscsInCoimbatore = lazyWithRetry(() => import('./pages/landingPages/BlueberryDiscsInCoimbatore'), 'BlueberryDiscsInCoimbatore');
const CocopeatBlocksWholesaleUSA = lazyWithRetry(() => import('./pages/landingPages/CocopeatBlocksWholesaleUSA'), 'CocopeatBlocksWholesaleUSA');
const CocoCoirGrowBagsWholesale = lazyWithRetry(() => import('./pages/landingPages/CocoCoirGrowBagsWholesale'), 'CocoCoirGrowBagsWholesale');
const BuyCocopeatNewYork = lazyWithRetry(() => import('./pages/landingPages/BuyCocopeatNewYork'), 'BuyCocopeatNewYork');
const CocoCoirBriquettesBulk = lazyWithRetry(() => import('./pages/landingPages/CocoCoirBriquettesBulk'), 'CocoCoirBriquettesBulk');
const CocoCoirWholesaleSupplierUSA = lazyWithRetry(() => import('./pages/landingPages/CocoCoirWholesaleSupplierUSA'), 'CocoCoirWholesaleSupplierUSA');

// SEO Product Pages
const CoirErosionControlBlanketInUK = lazyWithRetry(() => import('./pages/landingPages/Products/CoirErosionControlBlanketInUK'), 'CoirErosionControlBlanketInUK');
const CoirErosionControlLogInUSA = lazyWithRetry(() => import('./pages/landingPages/Products/CoirErosionControlLogInUSA'), 'CoirErosionControlLogInUSA');
const WashedCocoHuskChipsBriquetteUK = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCocoHuskChipsBriquetteUK'), 'WashedCocoHuskChipsBriquetteUK');
const CocoHuskChipsBriquetteGermany = lazyWithRetry(() => import('./pages/landingPages/Products/CocoHuskChipsBriquetteGermany'), 'CocoHuskChipsBriquetteGermany');
const BufferedCocoHuskChipsBriquetteUSA = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoHuskChipsBriquetteUSA'), 'BufferedCocoHuskChipsBriquetteUSA');
const NaturalCocoPeatBriquetteAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBriquetteAustralia'), 'NaturalCocoPeatBriquetteAustralia');
const NaturalPlusCocoPeatBriquetteSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalPlusCocoPeatBriquetteSaudiArabia'), 'NaturalPlusCocoPeatBriquetteSaudiArabia');
const CustomSizeCocoPeatDiscInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/CustomSizeCocoPeatDiscInSpain'), 'CustomSizeCocoPeatDiscInSpain');
const CocoPeatDisc40cmInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc40cmInSaudiArabia'), 'CocoPeatDisc40cmInSaudiArabia');
const CocoPeatDisc35cmInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc35cmInNetherlands'), 'CocoPeatDisc35cmInNetherlands');
const CocoPeatDisc30cmInUAE = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc30cmInUAE'), 'CocoPeatDisc30cmInUAE');
const CocoPeatDisc25cmInAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc25cmInAustralia'), 'CocoPeatDisc25cmInAustralia');
const CocoPeatDisc22cmInUK = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc22cmInUK'), 'CocoPeatDisc22cmInUK');
const CocoPeatDisc16cmInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc16cmInSouthKorea'), 'CocoPeatDisc16cmInSouthKorea');
const CocoPeatDisc135cmInUSA = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc135cmInUSA'), 'CocoPeatDisc135cmInUSA');
const CocoPeatDisc10cmInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc10cmInJapan'), 'CocoPeatDisc10cmInJapan');
const CocoPeatDisc75cmInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc75cmInGermany'), 'CocoPeatDisc75cmInGermany');
const CocoPeatDisc6cmInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc6cmInVietnam'), 'CocoPeatDisc6cmInVietnam');
const CocoPeatDisc4cmInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/CocoPeatDisc4cmInSingapore'), 'CocoPeatDisc4cmInSingapore');
const CustomCocoCoirMixSubstrateBagInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/CustomCocoCoirMixSubstrateBagInSpain'), 'CustomCocoCoirMixSubstrateBagInSpain');
const HydroponicMixSubstrateBagInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/HydroponicMixSubstrateBagInSaudiArabia'), 'HydroponicMixSubstrateBagInSaudiArabia');
const StrawberryMixSubstrateBagInAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/StrawberryMixSubstrateBagInAustralia'), 'StrawberryMixSubstrateBagInAustralia');
const RaspberryMixSubstrateBagInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/RaspberryMixSubstrateBagInVietnam'), 'RaspberryMixSubstrateBagInVietnam');
const BlueberryMixSubstrateBagInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/BlueberryMixSubstrateBagInSingapore'), 'BlueberryMixSubstrateBagInSingapore');
const BerriesMixSubstrateBagInUK = lazyWithRetry(() => import('./pages/landingPages/Products/BerriesMixSubstrateBagInUK'), 'BerriesMixSubstrateBagInUK');
const FloweringMixSubstrateBagInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/FloweringMixSubstrateBagInNetherlands'), 'FloweringMixSubstrateBagInNetherlands');
const VegetationMixSubstrateBagInUAE = lazyWithRetry(() => import('./pages/landingPages/Products/VegetationMixSubstrateBagInUAE'), 'VegetationMixSubstrateBagInUAE');
const PropagationMixSubstrateBagInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/PropagationMixSubstrateBagInGermany'), 'PropagationMixSubstrateBagInGermany');
const GerminationMixSubstrateBagInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/GerminationMixSubstrateBagInSouthKorea'), 'GerminationMixSubstrateBagInSouthKorea');
const CoconutCoirTwineRopeInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/CoconutCoirTwineRopeInSaudiArabia'), 'CoconutCoirTwineRopeInSaudiArabia');
const TwistedCoconutCoirRopeInUAE = lazyWithRetry(() => import('./pages/landingPages/Products/TwistedCoconutCoirRopeInUAE'), 'TwistedCoconutCoirRopeInUAE');
const CurledCoconutCoirRopeInUSA = lazyWithRetry(() => import('./pages/landingPages/Products/CurledCoconutCoirRopeInUSA'), 'CurledCoconutCoirRopeInUSA');
const BufferedCocoCoirGrowBag90x15x12cmInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoCoirGrowBag90x15x12cmInSpain'), 'BufferedCocoCoirGrowBag90x15x12cmInSpain');
const WashedCocoCoirGrowBag90x15x12cmInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCocoCoirGrowBag90x15x12cmInGermany'), 'WashedCocoCoirGrowBag90x15x12cmInGermany');
const NaturalCocoCoirGrowBag90x15x12cmInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoCoirGrowBag90x15x12cmInNetherlands'), 'NaturalCocoCoirGrowBag90x15x12cmInNetherlands');
const BufferedCocoCoirGrowBag72x20x12cmInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoCoirGrowBag72x20x12cmInJapan'), 'BufferedCocoCoirGrowBag72x20x12cmInJapan');
const WashedCocoCoirGrowBag72x20x12CmInUae = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCocoCoirGrowBag72x20x12CmInUae'), 'WashedCocoCoirGrowBag72x20x12CmInUae');
const NaturalCocoCoirGrowBag72x20x12CmInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoCoirGrowBag72x20x12CmInSouthKorea'), 'NaturalCocoCoirGrowBag72x20x12CmInSouthKorea');
const BufferedCocoCoirGrowBag60x15x10CmInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoCoirGrowBag60x15x10CmInSingapore'), 'BufferedCocoCoirGrowBag60x15x10CmInSingapore');
const WashedCocoCoirGrowBag60x15x10CmInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCocoCoirGrowBag60x15x10CmInVietnam'), 'WashedCocoCoirGrowBag60x15x10CmInVietnam');

const NaturalCocoCoirGrowBag60x15x10CmInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoCoirGrowBag60x15x10CmInSaudiArabia'), 'NaturalCocoCoirGrowBag60x15x10CmInSaudiArabia');
const BufferedCocoCoirGrowBag50x20x11CmInUk = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoCoirGrowBag50x20x11CmInUk'), 'BufferedCocoCoirGrowBag50x20x11CmInUk');
const WashedCocoCoirGrowBag50x20x11CmInUsa = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCocoCoirGrowBag50x20x11CmInUsa'), 'WashedCocoCoirGrowBag50x20x11CmInUsa');
const NaturalCocoCoirGrowBag50x20x11CmInAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoCoirGrowBag50x20x11CmInAustralia'), 'NaturalCocoCoirGrowBag50x20x11CmInAustralia');
const CustomCocoCoirGrowCubeInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/CustomCocoCoirGrowCubeInSpain'), 'CustomCocoCoirGrowCubeInSpain');
const HydroponicCocoCoirGrowCubeInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/HydroponicCocoCoirGrowCubeInSouthKorea'), 'HydroponicCocoCoirGrowCubeInSouthKorea');
const CocoCoirPropagationCubeInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCoirPropagationCubeInJapan'), 'CocoCoirPropagationCubeInJapan');
const BufferedCocoCoirGrowCubeInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoCoirGrowCubeInSaudiArabia'), 'BufferedCocoCoirGrowCubeInSaudiArabia');
const WashedLowEcCocoCoirCubeInUk = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoCoirCubeInUk'), 'WashedLowEcCocoCoirCubeInUk');
const NaturalCocoCoirCubeInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoCoirCubeInNetherlands'), 'NaturalCocoCoirCubenNetherlands');
const CocoCubeBlock20x10x7CmInUae = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCubeBlock20x10x7CmInUae'), 'CocoCubeBlock20x10x7CmInUae');
const CocoCubeBlock15x10x7CmInUsa = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCubeBlock15x10x7CmInUsa'), 'CocoCubeBlock15x10x7CmInUsa');
const CocoCoirGrowCube10x10x7CmInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCoirGrowCube10x10x7CmInVietnam'), 'CocoCoirGrowCube10x10x7CmInVietnam');
const CocoCoirGrowCube7x7x7CmInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCoirGrowCube7x7x7CmInGermany'), 'CocoCoirGrowCube7x7x7CmInGermany');
const NaturalCocoPeatBlock5kgInUsa = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock5kgInUsa'), 'NaturalCocoPeatBlock5kgInUsa');
const NaturalCocoPeatBlock45kgInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock45kgInNetherlands'), 'NaturalCocoPeatBlock45kgInNetherlands');
const NaturalCocoPeatBlock4kgInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock4kgInSouthKorea'), 'NaturalCocoPeatBlock4kgInSouthKorea');
const NaturalCocoPeatBlock3kgInUk = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock3kgInUk'), 'NaturalCocoPeatBlock3kgInUk');
const NaturalCocoPeatBlock2kgInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock2kgInSingapore'), 'NaturalCocoPeatBlock2kgInSingapore');
const NaturalCocoPeatBlock1kgInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock1kgInVietnam'), 'NaturalCocoPeatBlock1kgInVietnam');
const NaturalCocoPeatBlock650gInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCocoPeatBlock650gInSaudiArabia'), 'NaturalCocoPeatBlock650gInSaudiArabia');
const WashedLowEcCocoPeatBlock5kgInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock5kgInNetherlands'), 'WashedLowEcCocoPeatBlock5kgInNetherlands');
const WashedLowEcCocoPeatBlock45kgInUae = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock45kgInUae'), 'WashedLowEcCocoPeatBlock45kgInUae');
const WashedLowEcCocoPeatBlock4kgInAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock4kgInAustralia'), 'WashedLowEcCocoPeatBlock4kgInAustralia');
const WashedLowEcCocoPeatBlock3kgInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock3kgInGermany'), 'WashedLowEcCocoPeatBlock3kgInGermany');
const WashedLowEcCocoPeatBlock2kgInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock2kgInVietnam'), 'WashedLowEcCocoPeatBlock2kgInVietnam');
const WashedLowEcCocoPeatBlock1kgInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock1kgInGermany'), 'WashedLowEcCocoPeatBlock1kgInGermany');
const WashedLowEcCocoPeatBlock650gInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/WashedLowEcCocoPeatBlock650gInJapan'), 'WashedLowEcCocoPeatBlock650gInJapan');
const BufferedCocoPeatBlock5kgInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock5kgInGermany'), 'BufferedCocoPeatBlock5kgInGermany');
const BufferedCocoPeatBlock45kgInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock45kgInSingapore'), 'BufferedCocoPeatBlock45kgInSingapore');
const BufferedCocoPeatBlock4kgInUsa = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock4kgInUsa'), 'BufferedCocoPeatBlock4kgInUsa');
const BufferedCocoPeatBlock3kgInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock3kgInJapan'), 'BufferedCocoPeatBlock3kgInJapan');
const BufferedCocoPeatBlock2kgInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock2kgInSpain'), 'BufferedCocoPeatBlock2kgInSpain');
const BufferedCocoPeatBlock1kgInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock1kgInJapan'), 'BufferedCocoPeatBlock1kgInJapan');
const BufferedCocoPeatBlock650gInUae = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCocoPeatBlock650gInUae'), 'BufferedCocoPeatBlock650gInUae');
const PremiumCocoCoirBrick5kgInUae = lazyWithRetry(() => import('./pages/landingPages/Products/PremiumCocoCoirBrick5kgInUae'), 'PremiumCocoCoirBrick5kgInUae');
const PremiumCocoCoirBrick5kgGradePlusInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/PremiumCocoCoirBrick5kgGradePlusInSaudiArabia'), 'PremiumCocoCoirBrick5kgGradePlusInSaudiArabia');
const PremiumCocoCoirBrick5kgGradePlusPlusInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/PremiumCocoCoirBrick5kgGradePlusPlusInNetherlands'), 'PremiumCocoCoirBrick5kgGradePlusPlusInNetherlands');
const ProCocoCoirBrick5kgInAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/ProCocoCoirBrick5kgInAustralia'), 'ProCocoCoirBrick5kgInAustralia');
const ProCocoCoirBrick5kgGradePlusInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/ProCocoCoirBrick5kgGradePlusInSpain'), 'ProCocoCoirBrick5kgGradePlusInSpain');
const ProCocoCoirBrick5kgGradePlusPlusInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/ProCocoCoirBrick5kgGradePlusPlusInSaudiArabia'), 'ProCocoCoirBrick5kgGradePlusPlusInSaudiArabia');
const CocoCoirBrickMix5kgInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCoirBrickMix5kgInSpain'), 'CocoCoirBrickMix5kgInSpain');
const CocoCoirBrickMix5kgGradePlusInUk = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCoirBrickMix5kgGradePlusInUk'), 'CocoCoirBrickMix5kgGradePlusInUk');
const CocoCoirBrickMix5kgGradePlusPlusInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/CocoCoirBrickMix5kgGradePlusPlusInSouthKorea'), 'CocoCoirBrickMix5kgGradePlusPlusInSouthKorea');
const BufferedCoirGrowBag25lInUae = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCoirGrowBag25lInUae'), 'BufferedCoirGrowBag25lInUae');
const WashedCoirGrowBag25lInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCoirGrowBag25lInSaudiArabia'), 'WashedCoirGrowBag25lInSaudiArabia');
const NaturalCoirGrowBag25lInNetherlands = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCoirGrowBag25lInNetherlands'), 'NaturalCoirGrowBag25lInNetherlands');
const BufferedCoirGrowBag20lInUsa = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCoirGrowBag20lInUsa'), 'BufferedCoirGrowBag20lInUsa');
const WashedCoirGrowBag20lInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCoirGrowBag20lInGermany'), 'WashedCoirGrowBag20lInGermany');
const NaturalCoirGrowBag20lInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCoirGrowBag20lInJapan'), 'NaturalCoirGrowBag20lInJapan');
const BufferedCoirGrowBag18lInUk = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCoirGrowBag18lInUk'), 'BufferedCoirGrowBag18lInUk');
const WashedCoirGrowBag18lInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCoirGrowBag18lInVietnam'), 'WashedCoirGrowBag18lInVietnam');
const NaturalCoirGrowBag18lInJapan = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCoirGrowBag18lInJapan'), 'NaturalCoirGrowBag18lInJapan');
const BufferedCoirGrowBag15lInGermany = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCoirGrowBag15lInGermany'), 'BufferedCoirGrowBag15lInGermany');
const WashedCoirGrowBag15lInUk = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCoirGrowBag15lInUk'), 'WashedCoirGrowBag15lInUk');
const NaturalCoirGrowBag15lInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCoirGrowBag15lInSingapore'), 'NaturalCoirGrowBag15lInSingapore');
const BufferedCoirGrowBag12lInAustralia = lazyWithRetry(() => import('./pages/landingPages/Products/BufferedCoirGrowBag12lInAustralia'), 'BufferedCoirGrowBag12lInAustralia');
const WashedCoirGrowBag12lInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/WashedCoirGrowBag12lInSouthKorea'), 'WashedCoirGrowBag12lInSouthKorea');
const NaturalCoirGrowBag12lInSpain = lazyWithRetry(() => import('./pages/landingPages/Products/NaturalCoirGrowBag12lInSpain'), 'NaturalCoirGrowBag12lInSpain');
const GeotextileGradeCoirFiberBaleInVietnam = lazyWithRetry(() => import('./pages/landingPages/Products/GeotextileGradeCoirFiberBaleInVietnam'), 'GeotextileGradeCoirFiberBaleInVietnam');
const MattressGradeCoirFiberBaleInSouthKorea = lazyWithRetry(() => import('./pages/landingPages/Products/MattressGradeCoirFiberBaleInSouthKorea'), 'MattressGradeCoirFiberBaleInSouthKorea');
const WhiteCoirFiberBaleInSaudiArabia = lazyWithRetry(() => import('./pages/landingPages/Products/WhiteCoirFiberBaleInSaudiArabia'), 'WhiteCoirFiberBaleInSaudiArabia');
const BrownCoirFiberBaleInSingapore = lazyWithRetry(() => import('./pages/landingPages/Products/BrownCoirFiberBaleInSingapore'), 'BrownCoirFiberBaleInSingapore');

// Eagerly load Authentication pages to prevent Suspend flickers during auth flow navigation
import AuthLayout from './layouts/AuthLayout';
import OTPForm from './components/auth/OTPForm';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Admin Pages
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const AdminProducts = lazyWithRetry(() => import('./pages/AdminProducts'), 'AdminProducts');
const AdminCategories = lazyWithRetry(() => import('./pages/AdminCategories'), 'AdminCategories');
const AdminOrders = lazyWithRetry(() => import('./pages/AdminOrders'), 'AdminOrders');
const AdminUsers = lazyWithRetry(() => import('./pages/AdminUsers'), 'AdminUsers');
const AdminInquiries = lazyWithRetry(() => import('./pages/admin/AdminInquiries'), 'AdminInquiries');
const AdminPayments = lazyWithRetry(() => import('./pages/admin/AdminPayments'), 'AdminPayments');
const AdminRefunds = lazyWithRetry(() => import('./pages/admin/AdminRefunds'), 'AdminRefunds');
const AdminTesting = lazyWithRetry(() => import('./pages/AdminTesting'), 'AdminTesting');
const AdminReports = lazyWithRetry(() => import('./pages/AdminReports'), 'AdminReports');
const AdminSettings = lazyWithRetry(() => import('./pages/AdminSettings'), 'AdminSettings');
const AdminCurrencyManagement = lazyWithRetry(() => import('./pages/AdminCurrencyManagement'), 'AdminCurrencyManagement');
const AdminShippingManagement = lazyWithRetry(() => import('./pages/AdminShippingManagement'), 'AdminShippingManagement');
const AdminDiscounts = lazyWithRetry(() => import('./pages/AdminDiscounts'), 'AdminDiscounts');
const AdminQuoteRequests = lazyWithRetry(() => import('./pages/admin/AdminQuoteRequests'), 'AdminQuoteRequests');
const AdminQuoteRequestDetails = lazyWithRetry(() => import('./pages/admin/AdminQuoteRequestDetails'), 'AdminQuoteRequestDetails');

// User Protected Route
const Marketplace = lazyWithRetry(() => import('./dashboards/Marketplace'), 'Marketplace');
const DashboardLayout = lazyWithRetry(() => import('./dashboards/DashboardLayout'), 'DashboardLayout');
const Orders = lazyWithRetry(() => import('./pages/account/Orders'), 'Orders');
const OrderDetails = lazyWithRetry(() => import('./pages/account/OrderDetails'), 'OrderDetails');
const OrderPaymentMilestones = lazyWithRetry(() => import('./pages/account/OrderPaymentMilestones'), 'OrderPaymentMilestones');
import Cart from './pages/account/Cart';
const Checkout = lazyWithRetry(() => import('./pages/account/Checkout'), 'Checkout');
const OrderSummary = lazyWithRetry(() => import('./pages/account/OrderSummary'), 'OrderSummary');
const Payment = lazyWithRetry(() => import('./pages/account/Payment'), 'Payment');
const OrderSuccess = lazyWithRetry(() => import('./pages/account/OrderSuccess'), 'OrderSuccess');
const TrackOrder = lazyWithRetry(() => import('./pages/account/TrackOrder'), 'TrackOrder');
const SavedCart = lazyWithRetry(() => import('./pages/account/SavedCart'), 'SavedCart');
const Address = lazyWithRetry(() => import('./pages/account/Address'), 'Address');
const Settings = lazyWithRetry(() => import('./pages/account/Settings'), 'Settings');
const Profile = lazyWithRetry(() => import('./pages/account/Profile'), 'Profile');
const ProductView = lazyWithRetry(() => import('./pages/account/ProductView'), 'ProductView');
const Quotes = lazyWithRetry(() => import('./pages/account/Quotes'), 'Quotes');
const QuoteDetails = lazyWithRetry(() => import('./pages/account/QuoteDetails'), 'QuoteDetails');
const RequestQuotePage = lazyWithRetry(() => import('./pages/account/RequestQuotePage'), 'RequestQuotePage');
const Notifications = lazyWithRetry(() => import('./pages/account/Notifications'), 'Notifications');
const PaymentHistory = lazyWithRetry(() => import('./pages/account/PaymentHistory'), 'PaymentHistory');
const CustomerTestingReports = lazyWithRetry(() => import('./pages/account/CustomerTestingReports'), 'CustomerTestingReports');
const HelpCenter = lazyWithRetry(() => import('./pages/account/HelpCenter'), 'HelpCenter');
const MobileAccount = lazyWithRetry(() => import('./pages/account/MobileAccount'), 'MobileAccount');

import { Ship } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Loading screen matching the requested design
const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-[#2F7D32] border-t-transparent border-l-transparent rounded-full animate-spin"></div>

      {/* Inner moving ship */}
      <motion.div
        animate={{
          y: [-2, 2, -2],
          rotate: [-5, 5, -5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-[#2F7D32]"
      >
        <Ship className="w-8 h-8" />
      </motion.div>
    </div>
    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-stone-400 font-sans">
      Loading Cocoveera...
    </p>
  </div>
);

// Utility to safely parse JWT
const parseJwtSafe = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const decoded = parseJwtSafe(token);
  if (!decoded || !decoded.exp) return false;
  return (decoded.exp * 1000) > Date.now();
};

// Guard for user authenticated pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // STRICT BROWSER HISTORY SECURITY: Verify token directly in sessionStorage
  const token = sessionStorage.getItem('cocoveera_token');
  const hasValidToken = isTokenValid(token);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !hasValidToken) {
    const fullPath = location.pathname + location.search + location.hash;
    sessionStorage.setItem('postLoginRedirect', fullPath);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Guard for guest pages
const GuestRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return children;
};

// Guard for admin pages
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  // STRICT BROWSER HISTORY SECURITY: Verify token directly in sessionStorage
  const adminToken = sessionStorage.getItem('adminToken');
  const hasValidToken = isTokenValid(adminToken);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!admin || !hasValidToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicLayout = () => {
  const location = useLocation();

  const authPaths = ['/login', '/register', '/verify-otp'];
  const hideFooter = authPaths.includes(location.pathname);
  const isAuthPage = authPaths.includes(location.pathname);

  useEffect(() => {
    if (isAuthPage) {
      document.documentElement.classList.add('auth-page');
      document.body.classList.add('auth-page');
    } else {
      document.documentElement.classList.remove('auth-page');
      document.body.classList.remove('auth-page');
    }
    return () => {
      document.documentElement.classList.remove('auth-page');
      document.body.classList.remove('auth-page');
    };
  }, [isAuthPage]);

  return (
    <div
      className={`flex flex-col min-h-screen relative text-[#1A1A1A] font-sans bg-stone-50 ${isAuthPage ? 'auth-page' : ''}`}
    >
      <div className="relative z-10 flex flex-col flex-grow w-full">
        <Navbar />
        <div className="flex-grow flex flex-col w-full pt-[134px]">
          <ErrorBoundary>
            <Suspense fallback={<div className="flex-grow flex items-center justify-center opacity-0 transition-opacity duration-300 delay-150"><div className="w-8 h-8 border-4 border-stone-200 border-t-[#2F7D32] rounded-full animate-spin"></div></div>}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
        {!hideFooter && <Footer />}
      </div>
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const pending = sessionStorage.getItem('postLoginRedirect');
    if (pending && pathname === pending.split('?')[0]) {
      sessionStorage.removeItem('postLoginRedirect');
    }
  }, [pathname]);
  return null;
};



function AppContent() {
  // Security: Handle back button and bfcache navigation without allowing cached protected pages
  useEffect(() => {
    const verifySecurityState = () => {
      const token = sessionStorage.getItem('cocoveera_token');
      const adminToken = sessionStorage.getItem('adminToken');

      const hasValidUserToken = isTokenValid(token);
      const hasValidAdminToken = isTokenValid(adminToken);

      const path = window.location.pathname;
      const isUserProtected = !path.startsWith('/admin') && (path.includes('/dashboard') || path.includes('/orders') || path.includes('/cart') || path.includes('/checkout') || path.includes('/profile') || path.includes('/settings') || path.includes('/quotes') || path.includes('/payments') || path.includes('/testing-reports') || path.includes('/notifications') || path.includes('/support') || path.includes('/mobile') || path.includes('/address') || path.includes('/wishlist') || path.includes('/saved'));
      const isAdminProtected = path.startsWith('/admin');

      if (isAdminProtected && !hasValidAdminToken) {
        window.location.replace('/login');
      } else if (isUserProtected && !hasValidUserToken) {
        window.location.replace('/login');
      }
    };

    const handlePageShow = (event) => {
      verifySecurityState();
    };

    const handlePopState = () => {
      verifySecurityState();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <Routes>
        {/* Fullscreen Immerse Routes */}
        <Route path="/welcome" element={<Onboarding />} />

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/production-process" element={<QualityTesting />} />
          <Route path="/quality-testing" element={<Navigate to="/production-process" replace />} />
          <Route path="/global-network" element={<CoconutSubstrates />} />
          <Route path="/substrates" element={<Navigate to="/global-network" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<Onboarding />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/blueberry-discs-in-coimbatore" element={<BlueberryDiscsInCoimbatore />} />
          <Route path="/cocopeat-blocks-wholesale-usa" element={<CocopeatBlocksWholesaleUSA />} />
          <Route path="/coco-coir-grow-bags-wholesale" element={<CocoCoirGrowBagsWholesale />} />
          <Route path="/buy-cocopeat-new-york" element={<BuyCocopeatNewYork />} />
          <Route path="/coco-coir-briquettes-bulk" element={<CocoCoirBriquettesBulk />} />
          <Route path="/coco-coir-wholesale-supplier-usa" element={<CocoCoirWholesaleSupplierUSA />} />
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/products/:id" element={<ProductView />} />
          <Route path="/productview/:id" element={<ProductView />} />

          {/* product - landingpage */}
          {/* <Route path="/natural-coco-peat-block-5kg-in-usa" element={<NaturalCocoPeatBlock5kgInUsa />} /> */}
          <Route path="/coir-erosion-control-blanket-in-uk" element={<CoirErosionControlBlanketInUK />} />
          <Route path="/coir-erosion-control-log-in-usa" element={<CoirErosionControlLogInUSA />} />
          <Route path="/washed-coco-husk-chips-briquette-uk" element={<WashedCocoHuskChipsBriquetteUK />} />
          <Route path="/coco-husk-chips-briquette-germany" element={<CocoHuskChipsBriquetteGermany />} />
          <Route path="/buffered-coco-husk-chips-briquette-usa" element={<BufferedCocoHuskChipsBriquetteUSA />} />
          <Route path="/natural-coco-peat-briquette-australia" element={<NaturalCocoPeatBriquetteAustralia />} />
          <Route path="/natural-plus-coco-peat-briquette-saudi-arabia" element={<NaturalPlusCocoPeatBriquetteSaudiArabia />} />
          <Route path="/custom-size-coco-peat-disc-in-spain" element={<CustomSizeCocoPeatDiscInSpain />} />
          <Route path="/coco-peat-disc-40cm-in-saudi-arabia" element={<CocoPeatDisc40cmInSaudiArabia />} />
          <Route path="/coco-peat-disc-35cm-in-netherlands" element={<CocoPeatDisc35cmInNetherlands />} />
          <Route path="/coco-peat-disc-30cm-in-uae" element={<CocoPeatDisc30cmInUAE />} />
          <Route path="/coco-peat-disc-25cm-in-australia" element={<CocoPeatDisc25cmInAustralia />} />
          <Route path="/coco-peat-disc-22cm-in-uk" element={<CocoPeatDisc22cmInUK />} />
          <Route path="/coco-peat-disc-16cm-in-south-korea" element={<CocoPeatDisc16cmInSouthKorea />} />
          <Route path="/coco-peat-disc-135cm-in-usa" element={<CocoPeatDisc135cmInUSA />} />
          <Route path="/coco-peat-disc-13.5cm-in-usa" element={<CocoPeatDisc135cmInUSA />} />
          <Route path="/coco-peat-disc-10cm-in-japan" element={<CocoPeatDisc10cmInJapan />} />
          <Route path="/coco-peat-disc-75cm-in-germany" element={<CocoPeatDisc75cmInGermany />} />
          <Route path="/coco-peat-disc-7.5cm-in-germany" element={<CocoPeatDisc75cmInGermany />} />
          <Route path="/products/coco-peat-disc-75cm-in-germany" element={<CocoPeatDisc75cmInGermany />} />
          <Route path="/products/coco-peat-disc-7.5cm-in-germany" element={<CocoPeatDisc75cmInGermany />} />
          <Route path="/coco-peat-disc-6cm-in-vietnam" element={<CocoPeatDisc6cmInVietnam />} />
          <Route path="/coco-peat-disc-4cm-in-singapore" element={<CocoPeatDisc4cmInSingapore />} />
          <Route path="/custom-coco-coir-mix-substrate-bag-in-spain" element={<CustomCocoCoirMixSubstrateBagInSpain />} />
          <Route path="/hydroponic-mix-substrate-bag-in-saudi-arabia" element={<HydroponicMixSubstrateBagInSaudiArabia />} />
          <Route path="/strawberry-mix-substrate-bag-in-australia" element={<StrawberryMixSubstrateBagInAustralia />} />
          <Route path="/raspberry-mix-substrate-bag-in-vietnam" element={<RaspberryMixSubstrateBagInVietnam />} />
          <Route path="/blueberry-mix-substrate-bag-in-singapore" element={<BlueberryMixSubstrateBagInSingapore />} />
          <Route path="/berries-mix-substrate-bag-in-uk" element={<BerriesMixSubstrateBagInUK />} />
          <Route path="/flowering-mix-substrate-bag-in-netherlands" element={<FloweringMixSubstrateBagInNetherlands />} />
          <Route path="/vegetation-mix-substrate-bag-in-uae" element={<VegetationMixSubstrateBagInUAE />} />
          <Route path="/propagation-mix-substrate-bag-in-germany" element={<PropagationMixSubstrateBagInGermany />} />
          <Route path="/germination-mix-substrate-bag-in-south-korea" element={<GerminationMixSubstrateBagInSouthKorea />} />
          <Route path="/coconut-coir-twine-rope-in-saudi-arabia" element={<CoconutCoirTwineRopeInSaudiArabia />} />
          <Route path="/twisted-coconut-coir-rope-in-uae" element={<TwistedCoconutCoirRopeInUAE />} />
          <Route path="/curled-coconut-coir-rope-in-usa" element={<CurledCoconutCoirRopeInUSA />} />
          <Route path="/buffered-coco-coir-grow-bag-90x15x12-cm-in-spain" element={<BufferedCocoCoirGrowBag90x15x12cmInSpain />} />
          <Route path="/washed-coco-coir-grow-bag-90x15x12-cm-in-germany" element={<WashedCocoCoirGrowBag90x15x12cmInGermany />} />
          <Route path="/natural-coco-coir-grow-bag-90x15x12-cm-in-netherlands" element={<NaturalCocoCoirGrowBag90x15x12cmInNetherlands />} />
          <Route path="/buffered-coco-coir-grow-bag-72x20x12-cm-in-japan" element={<BufferedCocoCoirGrowBag72x20x12cmInJapan />} />
          <Route path="/washed-coco-coir-grow-bag-72x20x12-cm-in-uae" element={<WashedCocoCoirGrowBag72x20x12CmInUae />} />
          <Route path="/natural-coco-coir-grow-bag-72x20x12-cm-in-south-korea" element={<NaturalCocoCoirGrowBag72x20x12CmInSouthKorea />} />
          <Route path="/buffered-coco-coir-grow-bag-60x15x10-cm-in-singapore" element={<BufferedCocoCoirGrowBag60x15x10CmInSingapore />} />
          <Route path="/washed-coco-coir-grow-bag-60x15x10-cm-in-vietnam" element={<WashedCocoCoirGrowBag60x15x10CmInVietnam />} />
          <Route path="/natural-coco-coir-grow-bag-60x15x10-cm-in-saudi-arabia" element={<NaturalCocoCoirGrowBag60x15x10CmInSaudiArabia />} />
          <Route path="/buffered-coco-coir-grow-bag-50x20x11-cm-in-uk" element={<BufferedCocoCoirGrowBag50x20x11CmInUk />} />
          <Route path="/washed-coco-coir-grow-bag-50x20x11-cm-in-usa" element={<WashedCocoCoirGrowBag50x20x11CmInUsa />} />
          <Route path="/natural-coco-coir-grow-bag-50x20x11-cm-in-australia" element={<NaturalCocoCoirGrowBag50x20x11CmInAustralia />} />
          <Route path="/custom-coco-coir-grow-cube-in-spain" element={<CustomCocoCoirGrowCubeInSpain />} />
          <Route path="/hydroponic-coco-coir-grow-cube-in-south-korea" element={<HydroponicCocoCoirGrowCubeInSouthKorea />} />
          <Route path="/coco-coir-propagation-cube-in-japan" element={<CocoCoirPropagationCubeInJapan />} />
          <Route path="/buffered-coco-coir-grow-cube-in-saudi-arabia" element={<BufferedCocoCoirGrowCubeInSaudiArabia />} />
          <Route path="/washed-low-ec-coco-coir-cube-in-uk" element={<WashedLowEcCocoCoirCubeInUk />} />
          <Route path="/natural-coco-coir-cube-in-netherlands" element={<NaturalCocoCoirCubeInNetherlands />} />
          <Route path="/coco-cube-block-20x10x7-cm-in-uae" element={<CocoCubeBlock20x10x7CmInUae />} />
          <Route path="/coco-cube-block-15x10x7-cm-in-usa" element={<CocoCubeBlock15x10x7CmInUsa />} />
          <Route path="/coco-coir-grow-cube-10x10x7-cm-in-vietnam" element={<CocoCoirGrowCube10x10x7CmInVietnam />} />
          <Route path="/coco-coir-grow-cube-7x7x7-cm-in-germany" element={<CocoCoirGrowCube7x7x7CmInGermany />} />
          <Route path="/natural-coco-peat-block-5kg-in-usa" element={<NaturalCocoPeatBlock5kgInUsa />} />
          <Route path="/natural-coco-peat-block-45kg-in-netherlands" element={<NaturalCocoPeatBlock45kgInNetherlands />} />
          <Route path="/natural-coco-peat-block-4kg-in-south-korea" element={<NaturalCocoPeatBlock4kgInSouthKorea />} />
          <Route path="/natural-coco-peat-block-3kg-in-uk" element={<NaturalCocoPeatBlock3kgInUk />} />
          <Route path="/natural-coco-peat-block-2kg-in-singapore" element={<NaturalCocoPeatBlock2kgInSingapore />} />
          <Route path="/natural-coco-peat-block-1kg-in-vietnam" element={<NaturalCocoPeatBlock1kgInVietnam />} />
          <Route path="/natural-coco-peat-block-650g-in-saudi-arabia" element={<NaturalCocoPeatBlock650gInSaudiArabia />} />
          <Route path="/washed-low-ec-coco-peat-block-5kg-in-netherlands" element={<WashedLowEcCocoPeatBlock5kgInNetherlands />} />
          <Route path="/washed-low-ec-coco-peat-block-45kg-in-uae" element={<WashedLowEcCocoPeatBlock45kgInUae />} />
          <Route path="/washed-low-ec-coco-peat-block-4.5kg-in-uae" element={<WashedLowEcCocoPeatBlock45kgInUae />} />
          <Route path="/washed-low-ec-coco-peat-block-4kg-in-australia" element={<WashedLowEcCocoPeatBlock4kgInAustralia />} />
          <Route path="/washed-low-ec-coco-peat-block-3kg-in-germany" element={<WashedLowEcCocoPeatBlock3kgInGermany />} />
          <Route path="/washed-low-ec-coco-peat-block-2kg-in-vietnam" element={<WashedLowEcCocoPeatBlock2kgInVietnam />} />
          <Route path="/washed-low-ec-coco-peat-block-1kg-in-germany" element={<WashedLowEcCocoPeatBlock1kgInGermany />} />
          <Route path="/washed-low-ec-coco-peat-block-650g-in-japan" element={<WashedLowEcCocoPeatBlock650gInJapan />} />
          <Route path="/buffered-coco-peat-block-5kg-in-germany" element={<BufferedCocoPeatBlock5kgInGermany />} />
          <Route path="/buffered-coco-peat-block-45kg-in-singapore" element={<BufferedCocoPeatBlock45kgInSingapore />} />
          <Route path="/buffered-coco-peat-block-4.5kg-in-singapore" element={<BufferedCocoPeatBlock45kgInSingapore />} />
          <Route path="/buffered-coco-peat-block-4kg-in-usa" element={<BufferedCocoPeatBlock4kgInUsa />} />
          <Route path="/buffered-coco-peat-block-3kg-in-japan" element={<BufferedCocoPeatBlock3kgInJapan />} />
          <Route path="/buffered-coco-peat-block-2kg-in-spain" element={<BufferedCocoPeatBlock2kgInSpain />} />
          <Route path="/buffered-coco-peat-block-1kg-in-japan" element={<BufferedCocoPeatBlock1kgInJapan />} />
          <Route path="/buffered-coco-peat-block-650g-in-uae" element={<BufferedCocoPeatBlock650gInUae />} />
          <Route path="/premium-coco-coir-brick-5kg-in-uae" element={<PremiumCocoCoirBrick5kgInUae />} />
          <Route path="/premium-coco-coir-brick-5kg-grade-plus-in-saudi-arabia" element={<PremiumCocoCoirBrick5kgGradePlusInSaudiArabia />} />
          <Route path="/premium-coco-coir-brick-5kg-grade+-in-saudi-arabia" element={<PremiumCocoCoirBrick5kgGradePlusInSaudiArabia />} />
          <Route path="/premium-coco-coir-brick-5kg-grade-plus-plus-in-netherlands" element={<PremiumCocoCoirBrick5kgGradePlusPlusInNetherlands />} />
          <Route path="/premium-coco-coir-brick-5kg-grade++-in-netherlands" element={<PremiumCocoCoirBrick5kgGradePlusPlusInNetherlands />} />
          <Route path="/pro-coco-coir-brick-5kg-in-australia" element={<ProCocoCoirBrick5kgInAustralia />} />
          <Route path="/pro-coco-coir-brick-5kg-grade-plus-in-spain" element={<ProCocoCoirBrick5kgGradePlusInSpain />} />
          <Route path="/pro-coco-coir-brick-5kg-grade-plus-plus-in-saudi-arabia" element={<ProCocoCoirBrick5kgGradePlusPlusInSaudiArabia />} />
          <Route path="/pro-coco-coir-brick-5kg-grade++-in-saudi-arabia" element={<ProCocoCoirBrick5kgGradePlusPlusInSaudiArabia />} />
          <Route path="/coco-coir-brick-mix-5kg-in-spain" element={<CocoCoirBrickMix5kgInSpain />} />
          <Route path="/coco-coir-brick-mix-5kg-grade-plus-in-uk" element={<CocoCoirBrickMix5kgGradePlusInUk />} />
          <Route path="/coco-coir-brick-mix-5kg-grade-plus-plus-in-south-korea" element={<CocoCoirBrickMix5kgGradePlusPlusInSouthKorea />} />
          <Route path="/coco-coir-brick-mix-5kg-grade++-in-south-korea" element={<CocoCoirBrickMix5kgGradePlusPlusInSouthKorea />} />
          <Route path="/buffered-coir-grow-bag-25l-66-gal-in-uae" element={<BufferedCoirGrowBag25lInUae />} />
          <Route path="/washed-coir-grow-bag-25l-66-gal-in-saudi-arabia" element={<WashedCoirGrowBag25lInSaudiArabia />} />
          <Route path="/natural-coir-grow-bag-25l-66-gal-in-netherlands" element={<NaturalCoirGrowBag25lInNetherlands />} />
          <Route path="/buffered-coir-grow-bag-20l-5-gal-in-usa" element={<BufferedCoirGrowBag20lInUsa />} />
          <Route path="/washed-coir-grow-bag-20l-5-gal-in-germany" element={<WashedCoirGrowBag20lInGermany />} />
          <Route path="/natural-coir-grow-bag-20l-5-gal-in-japan" element={<NaturalCoirGrowBag20lInJapan />} />
          <Route path="/buffered-coir-grow-bag-18l-48-gal-in-uk" element={<BufferedCoirGrowBag18lInUk />} />
          <Route path="/washed-coir-grow-bag-18l-48-gal-in-vietnam" element={<WashedCoirGrowBag18lInVietnam />} />
          <Route path="/natural-coir-grow-bag-18l-48-gal-in-japan" element={<NaturalCoirGrowBag18lInJapan />} />
          <Route path="/buffered-coir-grow-bag-15l-4-gal-in-germany" element={<BufferedCoirGrowBag15lInGermany />} />
          <Route path="/washed-coir-grow-bag-15l-4-gal-in-uk" element={<WashedCoirGrowBag15lInUk />} />
          <Route path="/natural-coir-grow-bag-15l-4-gal-in-singapore" element={<NaturalCoirGrowBag15lInSingapore />} />
          <Route path="/buffered-coir-grow-bag-12l-3-gal-in-australia" element={<BufferedCoirGrowBag12lInAustralia />} />
          <Route path="/washed-coir-grow-bag-12l-3-gal-in-south-korea" element={<WashedCoirGrowBag12lInSouthKorea />} />
          <Route path="/natural-coir-grow-bag-12l-3-gal-in-spain" element={<NaturalCoirGrowBag12lInSpain />} />
          <Route path="/geotextile-grade-coir-fiber-bale-in-vietnam" element={<GeotextileGradeCoirFiberBaleInVietnam />} />
          <Route path="/products/geotextile-grade-coir-fiber-bale-in-vietnam" element={<GeotextileGradeCoirFiberBaleInVietnam />} />
          <Route path="/mattress-grade-coir-fiber-bale-in-south-korea" element={<MattressGradeCoirFiberBaleInSouthKorea />} />
          <Route path="/products/mattress-grade-coir-fiber-bale-in-south-korea" element={<MattressGradeCoirFiberBaleInSouthKorea />} />
          <Route path="/white-coir-fiber-bale-in-saudi-arabia" element={<WhiteCoirFiberBaleInSaudiArabia />} />
          <Route path="/products/white-coir-fiber-bale-in-saudi-arabia" element={<WhiteCoirFiberBaleInSaudiArabia />} />
          <Route path="/brown-coir-fiber-bale-in-singapore" element={<BrownCoirFiberBaleInSingapore />} />
          <Route path="/products/brown-coir-fiber-bale-in-singapore" element={<BrownCoirFiberBaleInSingapore />} />

          {/* Auth Flow - Shared Layout to prevent flicker */}
          <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/verify-otp" element={<OTPForm />} />
          </Route>
        </Route>

        {/* User Protected Routes under DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Marketplace />} />
          <Route path="/dashboard/product/:id" element={<ProductView />} />
          <Route path="/dashboard/productview/:id" element={<ProductView />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/payment/:id" element={<OrderPaymentMilestones />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/wishlist" element={<SavedCart />} />
          <Route path="/saved" element={<SavedCart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/:id" element={<QuoteDetails />} />
          <Route path="/dashboard/request-quote" element={<RequestQuotePage />} />
          <Route path="/request-quote" element={<RequestQuotePage />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/testing-reports" element={<CustomerTestingReports />} />
          <Route path="/dashboard/how-to-use" element={<Onboarding />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<HelpCenter />} />
          <Route path="/mobile" element={<MobileAccount />} />
        </Route>


        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <AdminProducts />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminProtectedRoute>
              <AdminCategories />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/inquiries"
          element={
            <AdminProtectedRoute>
              <AdminInquiries />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/quote-requests"
          element={
            <AdminProtectedRoute>
              <AdminQuoteRequests />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/quote-requests/:id"
          element={
            <AdminProtectedRoute>
              <AdminQuoteRequestDetails />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <AdminOrders />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectedRoute>
              <AdminPayments />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/refunds"
          element={
            <AdminProtectedRoute>
              <AdminRefunds />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/testing"
          element={
            <AdminProtectedRoute>
              <AdminTesting />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminReports />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/currency"
          element={
            <AdminProtectedRoute>
              <AdminCurrencyManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/shipping"
          element={
            <AdminProtectedRoute>
              <AdminShippingManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/discounts"
          element={
            <AdminProtectedRoute>
              <AdminDiscounts />
            </AdminProtectedRoute>
          }
        />

        {/* Catch all route and Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>


      </Routes>
    </Suspense>
  );
}

import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <AdminAuthProvider>
                  <AppContent />
                </AdminAuthProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
