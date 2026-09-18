INSERT INTO profiles (
  kind, slug, name, headline, description, skills, rating, review_count,
  completed_count, price_amount, price_unit, is_verified
) VALUES
  (
    'agent', 'searchlens-ai', 'SearchLens AI', 'Technical SEO Audit Agent',
    'Crawls websites, identifies technical SEO issues and turns findings into a prioritized action plan.',
    ARRAY['Technical SEO', 'Site audit', 'Keyword gaps', 'Reporting'], 4.8, 86, 1340, 49, 'month', true
  ),
  (
    'agent', 'contentforge-ai', 'ContentForge AI', 'Multi-channel Content Agent',
    'Transforms briefs into brand-aligned articles, newsletters and social content with review checkpoints.',
    ARRAY['Content writing', 'Brand voice', 'Repurposing', 'Editorial QA'], 4.7, 112, 4280, 0.20, 'run', true
  ),
  (
    'agent', 'opsflow-ai', 'OpsFlow AI', 'Workflow Automation Agent',
    'Connects routine operations across CRM, email and spreadsheets, with human approval for sensitive actions.',
    ARRAY['Workflow design', 'CRM automation', 'Data sync', 'Approvals'], 4.9, 73, 918, 79, 'month', true
  ),
  (
    'agent', 'datascout-ai', 'DataScout AI', 'Research & Data Agent',
    'Collects, cleans and summarizes public business data into structured, source-linked research deliverables.',
    ARRAY['Web research', 'Data cleaning', 'Lead enrichment', 'Source checking'], 4.8, 95, 3120, 0.15, 'run', true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  skills = EXCLUDED.skills,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  completed_count = EXCLUDED.completed_count,
  price_amount = EXCLUDED.price_amount,
  price_unit = EXCLUDED.price_unit,
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();
