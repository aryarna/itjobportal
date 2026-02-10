

document.addEventListener('DOMContentLoaded', () => {
    let allJobs = [];
    const jobContainer = document.getElementById('job-container');
    const titleInput = document.getElementById('jobSearch');
    const locationInput = document.getElementById('locationSearch');
    const categorySelect = document.getElementById('categoryFilter');
    const salaryRadios = document.getElementsByName('salary');

    // 1. Fetch Data
    fetch('jobs/jobs-data.json')
        .then(res => res.json())
        .then(data => {
            allJobs = data;
            displayJobs(allJobs); // Display all jobs initially (without filters)
            applyFilters(); // Apply the filters based on the current filter selection
        })
        .catch(err => console.error("Data error:", err));

    // 2. SMART MATCHING LOGIC (Substring + Fuzzy)
    function isSmartMatch(source, query) {
        if (!query) return true;
        source = source.toLowerCase().trim();
        query = query.toLowerCase().trim();

        // Check 1: Direct Substring (Agar "lore" "Bangalore" ke andar hai)
        if (source.includes(query)) return true;

        // Check 2: Fuzzy Similarity (Spelling mistake handle karne ke liye - 60% threshold)
        const similarity = getSimilarity(source, query);
        return similarity > 0.6;
    }

    // Levenshtein Algorithm for Spelling Mistakes
    function getSimilarity(s1, s2) {
        let longer = s1.length < s2.length ? s2 : s1;
        let shorter = s1.length < s2.length ? s1 : s2;
        if (longer.length === 0) return 1.0;
        let editDistance = levenshtein(longer, shorter);
        return (longer.length - editDistance) / parseFloat(longer.length);
    }

    function levenshtein(s1, s2) {
        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    // 3. MAIN FILTER LOGIC
    function applyFilters() {
        const titleQuery = titleInput.value;
        const locationQuery = locationInput.value;
        const selectedCategory = categorySelect.value;

        let minSalary = 0;
        salaryRadios.forEach(radio => {
            if (radio.checked) minSalary = parseInt(radio.value);
        });

        const filtered = allJobs.filter(job => {
            // Title & Tags Matching
            const titleMatch = isSmartMatch(job.title, titleQuery) || 
                               job.tags.some(tag => isSmartMatch(tag, titleQuery));

            // Location Matching (Now supports "lore" for "Bangalore")
            const locationMatch = isSmartMatch(job.location, locationQuery);

            // Category Match
            let categoryMatch = (selectedCategory === "" || job.category === selectedCategory);

            // If "Fresher" category is selected, we need to match the experience level too
            if (selectedCategory === "Fresher") {
                categoryMatch = job.experience === "Fresher"; // Only show jobs for freshers
            }

            // Salary Match
            const jobSalary = parseInt(job.salary) || 0;
            const salaryMatch = jobSalary >= minSalary;

            return titleMatch && locationMatch && categoryMatch && salaryMatch;
        });

        displayJobs(filtered);
    }

    // 4. DISPLAY LOGIC
    function displayJobs(jobs) {
        jobContainer.innerHTML = '';
        if (jobs.length === 0) {
            jobContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">
                <p>No jobs found. Try searching with different keywords!</p>
            </div>`;
            return;
        }

        jobs.forEach(job => {
            jobContainer.innerHTML += `
                <div class="job-card">
                    <div class="card-header">
                        <span class="category-tag">${job.category || 'IT Job'}</span>
                    </div>
                    <h3>${job.title}</h3>
                    <p class="company">${job.company}</p>
                    <div class="job-meta">
                        <span>📍 ${job.location}</span>
                        <span>💰 ₹${job.salary}L+ PA</span>
                    </div>
                    <div class="tags">
                        ${job.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <button class="apply-btn" onclick="window.location.href='job-details.html?id=${job.id}'">View Details</button>
                </div>`;
        });
    }

    // Event Listeners
    titleInput.addEventListener('input', applyFilters);
    locationInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    salaryRadios.forEach(r => r.addEventListener('change', applyFilters));
});


/*
document.addEventListener('DOMContentLoaded', () => {
    let allJobs = [];
    const jobContainer = document.getElementById('job-container');
    const titleInput = document.getElementById('jobSearch');
    const locationInput = document.getElementById('locationSearch');
    const categorySelect = document.getElementById('categoryFilter');
    const salaryRadios = document.getElementsByName('salary');

    // 1. Fetch Data
    fetch('jobs/jobs-data.json')
        .then(res => res.json())
        .then(data => {
            allJobs = data;
            displayJobs(allJobs);
        })
        .catch(err => console.error("Data error:", err));

    // 2. SMART MATCHING LOGIC (Substring + Fuzzy)
    function isSmartMatch(source, query) {
        if (!query) return true;
        source = source.toLowerCase().trim();
        query = query.toLowerCase().trim();

        // Check 1: Direct Substring (Agar "lore" "Bangalore" ke andar hai)
        if (source.includes(query)) return true;

        // Check 2: Fuzzy Similarity (Spelling mistake handle karne ke liye - 60% threshold)
        const similarity = getSimilarity(source, query);
        return similarity > 0.6; 
    }

    // Levenshtein Algorithm for Spelling Mistakes
    function getSimilarity(s1, s2) {
        let longer = s1.length < s2.length ? s2 : s1;
        let shorter = s1.length < s2.length ? s1 : s2;
        if (longer.length === 0) return 1.0;
        let editDistance = levenshtein(longer, shorter);
        return (longer.length - editDistance) / parseFloat(longer.length);
    }

    function levenshtein(s1, s2) {
        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    // 3. MAIN FILTER LOGIC
    /*function applyFilters() {
        const titleQuery = titleInput.value;
        const locationQuery = locationInput.value;
        const selectedCategory = categorySelect.value;
        
        let minSalary = 0;
        salaryRadios.forEach(radio => {
            if (radio.checked) minSalary = parseInt(radio.value);
        });

        const filtered = allJobs.filter(job => {
            // Title & Tags Matching
            const titleMatch = isSmartMatch(job.title, titleQuery) || 
                               job.tags.some(tag => isSmartMatch(tag, titleQuery));
            
            // Location Matching (Now supports "lore" for "Bangalore")
            const locationMatch = isSmartMatch(job.location, locationQuery);
            
            // Category & Salary Match
            const categoryMatch = selectedCategory === "" || (job.category && job.category === selectedCategory);
            const jobSalary = parseInt(job.salary) || 0;
            const salaryMatch = jobSalary >= minSalary;

            return titleMatch && locationMatch && categoryMatch && salaryMatch;
        });

        displayJobs(filtered);
    }  */
/*
        function applyFilters() {
    const titleQuery = titleInput.value;
    const locationQuery = locationInput.value;
    const selectedCategory = categorySelect.value;
    
    let minSalary = 0;
    salaryRadios.forEach(radio => {
        if (radio.checked) minSalary = parseInt(radio.value);
    });

    const filtered = allJobs.filter(job => {
        // Title & Tags Matching
        const titleMatch = isSmartMatch(job.title, titleQuery) || 
                           job.tags.some(tag => isSmartMatch(tag, titleQuery));
        
        // Location Matching (Now supports "lore" for "Bangalore")
        const locationMatch = isSmartMatch(job.location, locationQuery);
        
        // Category Match (Add Fresher filter check here)
        let categoryMatch = (selectedCategory === "" || job.category === selectedCategory);
        
        // If "Fresher" category is selected, we need to match the experience level too
        if (selectedCategory === "Fresher") {
            categoryMatch = job.experience === "Fresher"; // Only show jobs for freshers
        }

        // Salary Match
        const jobSalary = parseInt(job.salary) || 0;
        const salaryMatch = jobSalary >= minSalary;

        return titleMatch && locationMatch && categoryMatch && salaryMatch;
    });

    displayJobs(filtered);
   }

    // 4. DISPLAY LOGIC
    function displayJobs(jobs) {
        jobContainer.innerHTML = '';
        if (jobs.length === 0) {
            jobContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">
                <p>No jobs found. Try searching with different keywords!</p>
            </div>`;
            return;
        }

        jobs.forEach(job => {
            jobContainer.innerHTML += `
                <div class="job-card">
                    <div class="card-header">
                        <span class="category-tag">${job.category || 'IT Job'}</span>
                    </div>
                    <h3>${job.title}</h3>
                    <p class="company">${job.company}</p>
                    <div class="job-meta">
                        <span>📍 ${job.location}</span>
                        <span>💰 ₹${job.salary}L+ PA</span>
                    </div>
                    <div class="tags">
                        ${job.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <button class="apply-btn" onclick="window.location.href='job-details.html?id=${job.id}'">View Details</button>
                </div>`;
        });
    }

    // Event Listeners
    titleInput.addEventListener('input', applyFilters);
    locationInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    salaryRadios.forEach(r => r.addEventListener('change', applyFilters));
});

*/