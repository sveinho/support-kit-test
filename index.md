---
layout: page
title: File formats
headline: Understanding file format identification
permalink: /
---

<!-- Artikkel 1 -->
<article class="filterable" data-tags="gettingstarted">
  <div class="tag-container">
    <span class="tag tag-gettingstarted">Getting started</span>
  </div>
  <h2>Introduction to File Signatures (Magic Numbers)</h2>
  <p>File extensions can be easily changed, but the true identity of a file relies on its magic numbers. These are specific byte sequences at the very beginning of a file. For example, a PNG file always starts with <code>89 50 4E 47</code>.</p>
</article>

<!-- Artikkel 2 -->
<article class="filterable" data-tags="researcher">
  <div class="tag-container">
    <span class="tag tag-researcher">Researcher</span>
  </div>
  <h2>Using Hex Editors for Verification</h2>
  <p>Researchers often use Hex Editors to inspect raw bytes when automated tools fail. By analyzing the structural patterns and headers, you can recover damaged files or identify obfuscated malware formats that try to look like normal text logs.</p>
</article>

<!-- Artikkel 3 -->
<article class="filterable" data-tags="manager">
  <div class="tag-container">
    <span class="tag tag-manager">Manager</span>
  </div>
  <h2>Risk Management in File Ingestion Pipelines</h2>
  <p>Allowing users to upload documents introduces severe risks if validation depends solely on extensions. Managers should ensure system architectures enforce server-side mime-type checking and signature verification before processing or saving items to storage.</p>
</article>

<!-- Artikkel 4 -->
<article class="filterable" data-tags="trainer">
  <div class="tag-container">
    <span class="tag tag-trainer">Trainer</span>
  </div>
  <h2>Designing Interactive Format Labs</h2>
  <p>When training junior IT staff, set up hands-on challenges where extensions are intentionally stripped or mismatched (e.g., a JPG file renamed to log.txt).</p>
</article>

