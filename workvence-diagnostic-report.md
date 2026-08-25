# 🚀 Workvence Live End-to-End Diagnostic Report

**Target System:** [https://dev.workvence.com](https://dev.workvence.com)  
**Execution Date:** Tue, 25 Aug 2026 03:22:31 GMT  
**Total Execution Duration:** 107.54s  

## 📊 Executive Summary

| Metric | Value |
| :--- | :--- |
| **Total Journey Steps** | 19 |
| **Steps Passed** | ✅ 18 (95%) |
| **Steps Failed** | ❌ 1 |
| **Steps Skipped** | ⏸️ 0 |
| **Total Network Requests** | 1040 |
| **Total Backend API Calls** | 136 |
| **Average API Response Latency** | 569ms |
| **Browser Console Errors** | 1 |

## 🗺️ User Journey Steps

| # | Category | Step Name | Status | Duration | Details |
| :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | 1. Public & Discovery | **Load Homepage & Validate Navigation Discovery** | ✅ PASSED | 4678ms | Homepage loaded with navigation header and hero elements |
| 2 | 1. Public & Discovery | **Browse Public Catalog & Search Packages** | ✅ PASSED | 1886ms | Packages catalog rendered and searchable |
| 3 | Onboarding (Seller) | **Seller: Provision Disposable Temp-Mail Inbox** | ✅ PASSED | - | Generated TempMail.plus inbox: wv_seller_mt83l3qx43uz@mailto.plus |
| 4 | Onboarding (Seller) | **Seller: Submit Registration Form & Verify API Acceptance** | ✅ PASSED | 7411ms | Registration API accepted (HTTP 201). Form transitioned to OTP Step for user_50745s (wv_seller_mt83l3qx43uz@mailto.plus) |
| 5 | Onboarding (Seller) | **Seller: Retrieve 6-Digit OTP from Disposable Mailbox** | ✅ PASSED | 7860ms | OTP Code retrieved (211605) via TempMail.plus in 7.9s (4 polls) |
| 6 | Onboarding (Seller) | **Seller: Submit OTP & Verify Authenticated Session** | ✅ PASSED | 4468ms | Session authenticated. User: user_50745s (wv_seller_mt83l3qx43uz@mailto.plus), Role: SELLER |
| 7 | 3. Seller Studio | **Seller: Access Seller Dashboard & Performance Analytics** | ✅ PASSED | 2561ms | Seller dashboard and statistics rendered |
| 8 | 3. Seller Studio | **Seller: Create & Publish New Service Package (/organize)** | ❌ FAILED | 33955ms | Package creation studio error |
| 9 | 3. Seller Studio | **Seller: Inspect Earnings Dashboard & Clearance Center** | ✅ PASSED | 1847ms | Earnings summary cards, clearance timeline, and withdrawal options verified |
| 10 | Onboarding (Buyer) | **Buyer: Provision Disposable Temp-Mail Inbox** | ✅ PASSED | - | Generated TempMail.plus inbox: wv_buyer_mt83md1v4r2y@mailto.plus |
| 11 | Onboarding (Buyer) | **Buyer: Submit Registration Form & Verify API Acceptance** | ✅ PASSED | 5987ms | Registration API accepted (HTTP 201). Form transitioned to OTP Step for user_09459b (wv_buyer_mt83md1v4r2y@mailto.plus) |
| 12 | Onboarding (Buyer) | **Buyer: Retrieve 6-Digit OTP from Disposable Mailbox** | ✅ PASSED | 5615ms | OTP Code retrieved (682788) via TempMail.plus in 5.6s (3 polls) |
| 13 | Onboarding (Buyer) | **Buyer: Submit OTP & Verify Authenticated Session** | ✅ PASSED | 4492ms | Session authenticated. User: user_09459b (wv_buyer_mt83md1v4r2y@mailto.plus), Role: BUYER |
| 14 | 5. Buyer Actions | **Buyer: Browse Marketplace & Inspect Seller Service Package** | ✅ PASSED | 2438ms | Buyer inspected package details with tier tabs and CTA (Rendered) |
| 15 | 5. Buyer Actions | **Buyer: Create & Post Client Project Brief (/briefs/create)** | ✅ PASSED | 8025ms | Project brief created & verified on /briefs/my-briefs (Custom SaaS Platform with Multi-Tenant Architecture 4034) |
| 16 | 6. Cross-User Interaction | **Buyer: Initiate Real-Time Messaging & Chat Communication** | ✅ PASSED | 2419ms | Buyer messaging interface rendered & transmitted message |
| 17 | 6. Cross-User Interaction | **Seller: Receive Conversation in Real-Time & Check Orders Dashboard** | ✅ PASSED | 4684ms | Seller messaging inbox and orders progression dashboard verified |
| 18 | 7. Support & Compliance | **Buyer: Create Support Ticket with Subject & Details (/support/new)** | ✅ PASSED | 5210ms | Support ticket submitted and portal interactive |
| 19 | 7. Support & Compliance | **Inspect Help Center, Trust & Safety, Terms of Service, Privacy Policy** | ✅ PASSED | 1917ms | All legal, compliance, and support knowledge bases verified |

## ⏱️ Page Performance & Load Time Matrix

| Page / Route | URL | TTFB (ms) | DOM Ready (ms) | Full Load Time (ms) |
| :--- | :--- | :---: | :---: | :---: |
| **Homepage** | `https://dev.workvence.com/` | 3016ms | 4368ms | **-ms** |
| **Packages Catalog** | `https://dev.workvence.com/packages` | 194ms | 237ms | **-ms** |
| **Seller Register Page** | `https://dev.workvence.com/register` | 196ms | 305ms | **-ms** |
| **Seller Dashboard** | `https://dev.workvence.com/dashboard` | 206ms | 438ms | **-ms** |
| **Create Service Studio** | `https://dev.workvence.com/organize` | 233ms | 270ms | **-ms** |
| **Earnings Dashboard** | `https://dev.workvence.com/earnings` | 193ms | 223ms | **-ms** |
| **Buyer Register Page** | `https://dev.workvence.com/register` | 202ms | 1484ms | **-ms** |
| **Target Package Inspection** | `https://dev.workvence.com/packages` | 206ms | 277ms | **-ms** |
| **Create Brief Page** | `https://dev.workvence.com/briefs/create` | 195ms | 467ms | **-ms** |
| **Buyer My Briefs** | `https://dev.workvence.com/briefs/my-briefs` | 219ms | 475ms | **-ms** |
| **Buyer Messages Inbox** | `https://dev.workvence.com/messages` | 216ms | 243ms | **267ms** |
| **Seller Messages Inbox** | `https://dev.workvence.com/messages` | 196ms | 231ms | **258ms** |
| **Seller Orders Dashboard** | `https://dev.workvence.com/orders` | 192ms | 219ms | **-ms** |
| **Create Support Ticket** | `https://dev.workvence.com/support/new` | 198ms | 225ms | **-ms** |
| **Help Center** | `https://dev.workvence.com/help-center` | 219ms | 243ms | **-ms** |
| **Trust & Safety** | `https://dev.workvence.com/trust-safety` | 191ms | 287ms | **-ms** |
| **Terms of Service** | `https://dev.workvence.com/terms` | 194ms | 461ms | **-ms** |
| **Privacy Policy** | `https://dev.workvence.com/privacy` | 195ms | 458ms | **-ms** |

## 🌐 API Endpoint Telemetry Matrix

| HTTP Method | Endpoint URL | Status | Latency (ms) | Health |
| :---: | :--- | :---: | :---: | :---: |
| `GET` | `https://dev.workvence.com/api/auth/check-availability?username=user_50745s` | **200** | 367ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/check-availability?email=wv_seller_mt83l3qx43uz%40mailto.plus` | **200** | 248ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/auth/register` | **201** | 325ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/auth/verify-otp` | **200** | 235ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/auth/login` | **202** | 336ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_50745s&background=0D9488&color=fff&bold=true&length=2` | **200** | 338ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 1138ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1263ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 1271ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 1325ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/gigs?sort=sales&limit=6` | **200** | 1350ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1499ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 1564ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1730ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 1801ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1961ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 2048ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 925ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1165ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_50745s&background=0D9488&color=fff&bold=true&length=2` | **200** | 0ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 209ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 239ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/orders` | **200** | 247ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 251ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 270ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 465ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 518ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 449ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 659ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_50745s&background=0D9488&color=fff&bold=true&length=2` | **200** | 1ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 220ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 256ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 366ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 376ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 496ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 590ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 577ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 792ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 206ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_50745s&background=0D9488&color=fff&bold=true&length=2` | **200** | 0ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 213ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 229ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 264ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 369ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/earnings/statement` | **200** | 410ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/payouts` | **200** | 413ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/payouts/status` | **200** | 452ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 570ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 542ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 742ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/check-availability?username=user_09459b` | **200** | 206ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/check-availability?email=wv_buyer_mt83md1v4r2y%40mailto.plus` | **200** | 231ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/auth/register` | **201** | 349ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/auth/verify-otp` | **200** | 243ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/auth/login` | **202** | 338ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 347ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 1308ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1326ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 1347ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 1462ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/gigs?sort=sales&limit=6` | **200** | 1513ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1542ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 1691ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1746ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 1922ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1957ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 2158ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 827ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 1034ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 0ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 358ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 397ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 409ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 430ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/gigs?sort=createdAt&limit=20&page=1` | **200** | 443ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/gigs?sort=sales&limit=6` | **200** | 457ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=naimdev&background=0D9488&color=fff&bold=true&length=2` | **200** | 17ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/gigs?limit=4` | **200** | 560ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 613ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 659ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=borshi&background=0D9488&color=fff&bold=true&length=2` | **200** | 263ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 528ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 764ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 1ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 231ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 231ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 245ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 248ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 484ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 490ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 451ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 656ms | 🟢 OK |
| `POST` | `https://dev.workvence.com/api/briefs/ai-generate` | **200** | 932ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 0ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 231ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 243ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 243ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 248ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/briefs/my-briefs` | **200** | 264ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 482ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 484ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 713ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 1ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 240ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 252ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 255ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 481ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 458ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 681ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 210ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_50745s&background=0D9488&color=fff&bold=true&length=2` | **200** | 0ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 224ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 234ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 239ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 431ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 407ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 613ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_50745s&background=0D9488&color=fff&bold=true&length=2` | **200** | 5ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 214ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 228ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 258ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 353ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/orders` | **200** | 358ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 553ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 548ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 747ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 1ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/admin/categories` | **200** | 233ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/orders` | **200** | 247ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/conversations` | **200** | 248ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 251ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 484ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/auth/me` | **200** | 685ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 216ms | 🟢 OK |
| `GET` | `https://dev.workvence.com/api/notifications` | **200** | 430ms | 🟢 OK |
| `GET` | `https://ui-avatars.com/api/?name=user_09459b&background=0D9488&color=fff&bold=true&length=2` | **200** | 0ms | 🟢 OK |

## ⚠️ Errors & Anomalies Log

- **[Console Error]**: `Failed to load resource: the server responded with a status of 404 (Not Found)`

