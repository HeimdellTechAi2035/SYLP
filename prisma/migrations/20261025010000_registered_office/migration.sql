-- Registered office verified against Companies House company 16478408.
UPDATE "Policy" SET body=replace(body, 'registered office Preston, PR1 9DJ', 'registered office 11 Lower Croft, Preston, England, PR1 9DJ'), "lastUpdated"=CURRENT_TIMESTAMP WHERE body LIKE '%registered office Preston, PR1 9DJ%';
