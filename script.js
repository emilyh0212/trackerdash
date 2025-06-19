// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Sample data with additional fields for bucket filtering
    const sampleData = [
      {
        id: 'SKU-12345',
        description: 'HVAC Filter 20x20x1',
        rule: 'rule1',
        forecast: 24500,
        mtdUsage: 32650,
        unitCost: 15.50,
        dayFlagged: 'June 13',
        demandPattern: 'Smooth',
        severity: 'critical',
        actionTaken: true,
        suppressed: false,
        feedback: null, // null, 'up', or 'down'
        tenant: 'behler-young',
        patternChangeDate: '2025-04-15', // Changed from Sparse to Smooth
        flagHistory: ['2025-06-13', '2025-05-20', '2025-04-10'] // Dates when this item was flagged
      },
      {
        id: 'SKU-67890',
        description: 'Compressor 2.5 Ton',
        rule: 'rule2',
        forecast: 18200,
        mtdUsage: 22750,
        unitCost: 850.00,
        dayFlagged: 'June 8',
        demandPattern: 'Smooth',
        severity: 'warning',
        actionTaken: true,
        suppressed: false,
        feedback: 'up', // null, 'up', or 'down'
        tenant: 'behler-young',
        patternChangeDate: null,
        flagHistory: ['2025-06-08', '2025-05-10']
      },
      {
        id: 'SKU-54321',
        description: 'Thermostat Smart WiFi',
        rule: 'rule4',
        forecast: 15800,
        mtdUsage: 9480,
        unitCost: 125.00,
        dayFlagged: 'June 22',
        demandPattern: 'Smooth',
        severity: 'critical',
        actionTaken: false,
        suppressed: false,
        feedback: null, // null, 'up', or 'down'
        tenant: 'worldwide-electric',
        patternChangeDate: '2025-06-01', // Changed from Erratic to Smooth
        flagHistory: ['2025-06-22', '2025-06-01', '2025-04-25', '2025-03-15']
      },
      {
        id: 'SKU-98765',
        description: 'Air Handler 3 Ton',
        rule: 'rule1',
        forecast: 32100,
        mtdUsage: 30495,
        unitCost: 1200.00,
        dayFlagged: 'June 15',
        demandPattern: 'Smooth',
        severity: 'ontrack',
        actionTaken: false,
        suppressed: false,
        feedback: 'down', // null, 'up', or 'down'
        tenant: 'behler-young',
        patternChangeDate: null,
        flagHistory: ['2025-06-15']
      },
      {
        id: 'SKU-13579',
        description: 'Refrigerant R410A',
        rule: 'rule3',
        forecast: 8400,
        mtdUsage: 12600,
        unitCost: 45.00,
        dayFlagged: 'June 17',
        demandPattern: 'Sparse',
        severity: 'warning',
        actionTaken: false,
        suppressed: true,
        feedback: 'up', // null, 'up', or 'down'
        tenant: 'other-tenant',
        patternChangeDate: '2025-05-01' // Changed from Smooth to Sparse
      },
      {
        id: 'SKU-24680',
        description: 'Heat Pump 4 Ton',
        rule: 'rule1',
        forecast: 45000,
        mtdUsage: 95000,
        unitCost: 2500.00,
        dayFlagged: 'June 10',
        demandPattern: 'Smooth',
        severity: 'critical',
        actionTaken: false,
        suppressed: false,
        feedback: null, // null, 'up', or 'down'
        tenant: 'worldwide-electric',
        patternChangeDate: null
      }
    ];
  
    let currentBucket = 'critical';
    let currentFilters = {
      rule: 'all',
      severity: 'all',
      tenant: 'all',
      status: 'all',
      pattern: 'all'
    };
  
    // Helper functions for new features
    function hasPatternDrift(item) {
      if (!item.patternChangeDate) return false;
      const changeDate = new Date(item.patternChangeDate);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      return changeDate >= sixtyDaysAgo;
    }
  
    function getRecurrenceCount(item) {
      if (!item.flagHistory || !Array.isArray(item.flagHistory)) return 0;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      return item.flagHistory.filter(date => {
        const flagDate = new Date(date);
        return flagDate >= sixMonthsAgo;
      }).length;
    }
  
    function getRecurrenceClass(count) {
      if (count >= 4) return 'high-recurrence';
      if (count >= 3) return 'medium-recurrence';
      return '';
    }
  
    // Bucket filtering logic
    function filterByBucket(data, bucket) {
      switch (bucket) {
        case 'critical':
          // Rule 1 or 2, Severity = Critical, MTD usage > forecast by >100%
          return data.filter(item => {
            const deviationPercent = Math.abs((item.mtdUsage - item.forecast) / item.forecast * 100);
            return (item.rule === 'rule1' || item.rule === 'rule2') && 
                   item.severity === 'critical' && 
                   deviationPercent > 100;
          });
        
        case 'high-dollar':
          // (MTD Usage × Unit Cost) − (Forecast × Unit Cost) > $2,000
          return data.filter(item => {
            const dollarVariance = Math.abs((item.mtdUsage * item.unitCost) - (item.forecast * item.unitCost));
            return dollarVariance > 2000;
          });
        
        case 'pattern-drift':
          // Demand pattern changed in last 60 days
          return data.filter(item => {
            if (!item.patternChangeDate) return false;
            const changeDate = new Date(item.patternChangeDate);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            return changeDate >= sixtyDaysAgo;
          });
        
        case 'all':
        default:
          return data;
      }
    }
  
    // Advanced filtering logic
    function applyAdvancedFilters(data, filters) {
      return data.filter(item => {
        if (filters.rule !== 'all' && item.rule !== filters.rule) return false;
        if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
        if (filters.tenant !== 'all' && item.tenant !== filters.tenant) return false;
        if (filters.status !== 'all') {
          if (filters.status === 'actioned' && !item.actionTaken) return false;
          if (filters.status === 'suppressed' && !item.suppressed) return false;
          if (filters.status === 'unresolved' && (item.actionTaken || item.suppressed)) return false;
        }
        if (filters.pattern !== 'all' && item.demandPattern.toLowerCase() !== filters.pattern) return false;
        return true;
      });
    }
  
    // Update bucket counts
    function updateBucketCounts() {
      const criticalCount = filterByBucket(sampleData, 'critical').length;
      const highDollarCount = filterByBucket(sampleData, 'high-dollar').length;
      const patternDriftCount = filterByBucket(sampleData, 'pattern-drift').length;
  
      document.getElementById('critical-count').textContent = criticalCount;
      document.getElementById('high-dollar-count').textContent = highDollarCount;
      document.getElementById('pattern-drift-count').textContent = patternDriftCount;
    }
  
    // Render table with filtered data
    function renderTable(data) {
      const tbody = document.querySelector('.deviation-table tbody');
      if (!tbody) return;
  
      // Clear existing rows except expandable ones
      const rows = tbody.querySelectorAll('tr:not(.expandable-row)');
      rows.forEach(row => row.remove());
  
      data.forEach(item => {
        const deviation = ((item.mtdUsage - item.forecast) / item.forecast * 100).toFixed(1);
        const deviationClass = deviation > 0 ? 'deviation-positive' : 'deviation-negative';
        const statusClass = `status-${item.severity}`;
        const actionBadge = item.actionTaken ? '<span class="badge badge-actioned">Yes</span>' : 
                           item.suppressed ? '<span class="badge badge-suppressed">Suppressed</span>' : 'No';
  
        // Check for pattern drift
        const isDrift = hasPatternDrift(item);
        const driftTag = isDrift ? `<span class="pattern-drift-tag">
          <svg class="pattern-drift-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Drift
        </span>` : '';
  
        // Calculate recurrence
        const recurrenceCount = getRecurrenceCount(item);
        const recurrenceClass = getRecurrenceClass(recurrenceCount);
        const recurrenceBadge = recurrenceCount > 1 ? 
          `<span class="recurrence-badge ${recurrenceClass}">Flagged ${recurrenceCount}×</span>` : 
          `<span class="recurrence-badge">First time</span>`;
  
        const row = document.createElement('tr');
        
        // Add pattern drift highlighting to the row
        if (isDrift) {
          row.classList.add('pattern-drift-row');
        }
        row.innerHTML = `
          <td>
            <div>${item.id}</div>
            <div style="font-size: 12px; color: #6B778C;">${item.description}</div>
          </td>
          <td><span class="badge badge-${item.rule}">${item.rule.charAt(0).toUpperCase() + item.rule.slice(1)}</span></td>
          <td>$${item.forecast.toLocaleString()}</td>
          <td>$${item.mtdUsage.toLocaleString()}</td>
          <td class="${deviationClass}">${deviation > 0 ? '+' : ''}${deviation}%</td>
          <td>${item.dayFlagged}</td>
          <td>${item.demandPattern}${driftTag}</td>
          <td>${recurrenceBadge}</td>
          <td><span class="status-indicator ${statusClass}"></span>${item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}</td>
          <td>${actionBadge}</td>
          <td>
            <div class="feedback-buttons" data-item-id="${item.id}">
              <div class="thumb-button thumb-up ${item.feedback === 'up' ? 'active' : ''}" data-feedback="up" data-tooltip="Helpful">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </div>
              <div class="thumb-button thumb-down ${item.feedback === 'down' ? 'active' : ''}" data-feedback="down" data-tooltip="Not Helpful">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 15V19a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                </svg>
              </div>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              ${!item.actionTaken && !item.suppressed ? 
                `<button class="action-button" onclick="openActionModal('${item.id}')">Take Action</button>
                 <button class="action-button secondary" onclick="openSuppressModal('${item.id}')">Suppress</button>` :
                `<button class="toggle-details">
                  Details
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>`
              }
              <button class="action-button forecast-link" onclick="openForecastChart('${item.id}', '${item.description}', '${item.tenant}')">
                View Forecast
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15,3 21,3 21,9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
  
      // Re-attach event listeners for toggle details and feedback buttons
      attachToggleListeners();
      attachFeedbackListeners();
    }
  
    // Attach toggle listeners
    function attachToggleListeners() {
      document.querySelectorAll('.toggle-details').forEach(button => {
        button.addEventListener('click', function() {
          const row = this.closest('tr');
          const expandableRow = row.nextElementSibling;
          const icon = this.querySelector('.toggle-icon');
          
          if (expandableRow && expandableRow.classList.contains('expandable-row')) {
            if (expandableRow.style.display === 'table-row') {
              expandableRow.style.display = 'none';
              icon.classList.remove('rotate');
            } else {
              expandableRow.style.display = 'table-row';
              icon.classList.add('rotate');
            }
          }
        });
      });
    }
  
    // Attach feedback listeners
    function attachFeedbackListeners() {
      document.querySelectorAll('.thumb-button').forEach(button => {
        button.addEventListener('click', function() {
          const feedbackContainer = this.closest('.feedback-buttons');
          const itemId = feedbackContainer.dataset.itemId;
          const feedbackType = this.dataset.feedback;
          const item = sampleData.find(item => item.id === itemId);
          
          if (item) {
            // Toggle feedback: if same feedback is clicked, remove it; otherwise set new feedback
            if (item.feedback === feedbackType) {
              item.feedback = null;
            } else {
              item.feedback = feedbackType;
            }
            
            // Update visual state for both buttons
            const thumbUpButton = feedbackContainer.querySelector('.thumb-up');
            const thumbDownButton = feedbackContainer.querySelector('.thumb-down');
            
            // Remove active class from both
            thumbUpButton.classList.remove('active');
            thumbDownButton.classList.remove('active');
            
            // Add active class to the selected feedback
            if (item.feedback === 'up') {
              thumbUpButton.classList.add('active');
            } else if (item.feedback === 'down') {
              thumbDownButton.classList.add('active');
            }
            
            // Log the action (for future analytics)
            const feedbackText = item.feedback ? (item.feedback === 'up' ? 'helpful' : 'not helpful') : 'no feedback';
            console.log(`Item ${itemId} marked as ${feedbackText} at ${new Date().toISOString()}`);
          }
        });
      });
    }
  
    // Bucket tab click handlers
    document.querySelectorAll('.bucket-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.bucket-tab').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update current bucket
        currentBucket = this.dataset.bucket;
        
        // Filter and render data
        const bucketData = filterByBucket(sampleData, currentBucket);
        const filteredData = applyAdvancedFilters(bucketData, currentFilters);
        renderTable(filteredData);
      });
    });
  
    // Advanced filters toggle
    document.getElementById('advanced-filters-toggle').addEventListener('click', function() {
      const drawer = document.getElementById('advanced-filters-drawer');
      const icon = this.querySelector('svg');
      
      drawer.classList.toggle('open');
      icon.style.transform = drawer.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  
    // Advanced filter change handlers
    document.querySelectorAll('#advanced-filters-drawer select').forEach(select => {
      select.addEventListener('change', function() {
        const filterId = this.id.replace('-filter', '');
        currentFilters[filterId] = this.value;
        
        // Apply filters based on current bucket
        let bucketData;
        if (currentBucket === 'all') {
          bucketData = sampleData;
        } else {
          bucketData = filterByBucket(sampleData, currentBucket);
        }
        const filteredData = applyAdvancedFilters(bucketData, currentFilters);
        renderTable(filteredData);
      });
    });
  
    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', function() {
      currentFilters = {
        rule: 'all',
        severity: 'all',
        tenant: 'all',
        status: 'all',
        pattern: 'all'
      };
      
      // Reset all select elements
      document.querySelectorAll('#advanced-filters-drawer select').forEach(select => {
        select.value = 'all';
      });
      
      // Re-render table based on current bucket
      let bucketData;
      if (currentBucket === 'all') {
        bucketData = sampleData;
      } else {
        bucketData = filterByBucket(sampleData, currentBucket);
      }
      const filteredData = applyAdvancedFilters(bucketData, currentFilters);
      renderTable(filteredData);
    });
  
    // Export CSV functionality
    document.getElementById('export-csv').addEventListener('click', function() {
      let bucketData;
      if (currentBucket === 'all') {
        bucketData = sampleData;
      } else {
        bucketData = filterByBucket(sampleData, currentBucket);
      }
      const filteredData = applyAdvancedFilters(bucketData, currentFilters);
      
      const csvContent = [
        ['Item ID', 'Description', 'Rule', 'Forecast', 'MTD Usage', 'Deviation %', 'Day Flagged', 'Demand Pattern', 'Severity', 'Action Taken'],
        ...filteredData.map(item => [
          item.id,
          item.description,
          item.rule,
          item.forecast,
          item.mtdUsage,
          ((item.mtdUsage - item.forecast) / item.forecast * 100).toFixed(1) + '%',
          item.dayFlagged,
          item.demandPattern,
          item.severity,
          item.actionTaken ? 'Yes' : (item.suppressed ? 'Suppressed' : 'No')
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentBucket}-deviations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  
    // Initialize trend chart
    const flaggedItemsCtx = document.getElementById("flaggedItemsTrendChart").getContext("2d");
  
    const flaggedItemsChart = new Chart(flaggedItemsCtx, {
      type: "line",
      data: {
        labels: ["May 19", "May 26", "Jun 2", "Jun 9", "Jun 16", "Jun 23"],
        datasets: [
          {
            label: "Flagged Items",
            data: [12, 15, 10, 18, 24, 22],
            borderColor: "#0052CC",
            backgroundColor: "rgba(0, 82, 204, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  
    // Dollar Impact Trendline Chart
    const dollarImpactCtx = document.getElementById("dollarImpactTrendChart").getContext("2d");
  
    // Sample data for dollar impact (replace with actual calculations based on sampleData)
    const dollarImpactData = [
      { week: "May 19", value: 15000 },
      { week: "May 26", value: 18000 },
      { week: "Jun 2", value: 12000 },
      { week: "Jun 9", value: 25000 },
      { week: "Jun 16", value: 30000 },
      { week: "Jun 23", value: 28000 },
    ];
  
    const dollarImpactChart = new Chart(dollarImpactCtx, {
      type: "line",
      data: {
        labels: dollarImpactData.map((d) => d.week),
        datasets: [
          {
            label: "Total $ Deviation",
            data: dollarImpactData.map((d) => d.value),
            borderColor: "#36B37E",
            backgroundColor: "rgba(54, 179, 126, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                return `$${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false,
            },
            ticks: {
              callback: function (value) {
                return `$${value.toLocaleString()}`;
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  
    // Initialize the dashboard
    updateBucketCounts();
    
    // Set initial bucket to 'all' to show all data
    currentBucket = 'all';
    
    // Remove active class from all bucket tabs initially
    document.querySelectorAll('.bucket-tab').forEach(t => t.classList.remove('active'));
    
    // Initialize the dashboard
    updateBucketCounts();
    renderTable(sampleData);
  
    // Attach event listeners for toggle details and feedback buttons for initially rendered data
    attachToggleListeners();
    attachFeedbackListeners();
  });
  
  // Function to open forecast chart in new tab
  function openForecastChart(itemId, description, tenant) {
    // Use the local simulator file instead of external URL
    const baseUrl = 'file:///home/ubuntu/mid_month_deviation_dashboard/forecast_chart_simulator.html';
    const params = new URLSearchParams({
      item: itemId,
      description: description,
      tenant: tenant,
      location: '400', // Simulated location
      source: 'manus-dashboard'
    });
    
    const fullUrl = `${baseUrl}?${params.toString()}`;
    
    // Log the action for analytics
    console.log('Opening forecast chart for:', {
      itemId,
      description,
      tenant,
      url: fullUrl
    });
    
    // Open in new tab
    window.open(fullUrl, '_blank');
  }
  
  // Action Modal (keeping existing functionality)
  function openActionModal(itemId) {
    document.getElementById('actionItemId').textContent = itemId;
    document.getElementById('actionModal').style.display = 'block';
  }
  
  function closeActionModal() {
    document.getElementById('actionModal').style.display = 'none';
  }
  
  function submitAction() {
    const itemId = document.getElementById('actionItemId').textContent;
    const actionType = document.getElementById('actionType').value;
    const adjustmentValue = document.getElementById('adjustmentValue').value;
    const actionReason = document.getElementById('actionReason').value;
    const actionNotes = document.getElementById('actionNotes').value;
    
    console.log('Action submitted:', {
      itemId,
      actionType,
      adjustmentValue,
      actionReason,
      actionNotes,
      timestamp: new Date().toISOString()
    });
    
    closeActionModal();
    
    // Reset form
    document.getElementById('adjustmentValue').value = '';
    document.getElementById('actionNotes').value = '';
  }
  
  // Suppress Modal (keeping existing functionality)
  function openSuppressModal(itemId) {
    document.getElementById('suppressItemId').textContent = itemId;
    document.getElementById('suppressModal').style.display = 'block';
  }
  
  function closeSuppressModal() {
    document.getElementById('suppressModal').style.display = 'none';
  }
  
  function submitSuppression() {
    const itemId = document.getElementById('suppressItemId').textContent;
    const suppressReason = document.getElementById('suppressReason').value;
    const suppressDuration = document.getElementById('suppressDuration').value;
    const suppressNotes = document.getElementById('suppressNotes').value;
    
    console.log('Suppression submitted:', {
      itemId,
      suppressReason,
      suppressDuration,
      suppressNotes,
      timestamp: new Date().toISOString()
    });
    
    closeSuppressModal();
    
    // Reset form
    document.getElementById('suppressNotes').value = '';
  }
  
  
    // Chart initialization
    function initializeCharts() {
      const flaggedItemsCtx = document.getElementById('flaggedItemsTrendChart').getContext('2d');
      new Chart(flaggedItemsCtx, {
        type: 'line',
        data: {
          labels: ['May', 'June', 'July'],
          datasets: [{
            label: 'Flagged Items',
            data: [10, 15, 12],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
  
      const dollarImpactCtx = document.getElementById('dollarImpactTrendChart').getContext('2d');
      new Chart(dollarImpactCtx, {
        type: 'line',
        data: {
          labels: ['May', 'June', 'July'],
          datasets: [{
            label: 'Dollar Impact',
            data: [5000, 7500, 6000],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  
    // Call initializeCharts when the DOM is loaded
    initializeCharts();
  
  
  