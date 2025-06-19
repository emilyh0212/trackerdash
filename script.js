// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Toggle expandable rows
    document.querySelectorAll('.toggle-details').forEach(button => {
      button.addEventListener('click', function() {
        const row = this.closest('tr');
        const expandableRow = row.nextElementSibling;
        const icon = this.querySelector('.toggle-icon');
        
        if (expandableRow.style.display === 'table-row') {
          expandableRow.style.display = 'none';
          icon.classList.remove('rotate');
        } else {
          expandableRow.style.display = 'table-row';
          icon.classList.add('rotate');
        }
      });
    });
    
    // Initialize trend chart
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['May 19', 'May 26', 'Jun 2', 'Jun 9', 'Jun 16', 'Jun 23'],
        datasets: [{
          label: 'Flagged Items',
          data: [12, 15, 10, 18, 24, 22],
          borderColor: '#0052CC',
          backgroundColor: 'rgba(0, 82, 204, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  });
  
  // Action Modal
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
    
    // In a real implementation, this would send data to the server
    console.log('Action submitted:', {
      itemId,
      actionType,
      adjustmentValue,
      actionReason,
      actionNotes,
      timestamp: new Date().toISOString()
    });
    
    // Mock update UI to show action taken
    const rows = document.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
      const firstCell = rows[i].querySelector('td:first-child');
      if (firstCell && firstCell.textContent.includes(itemId)) {
        const actionCell = rows[i].querySelector('td:nth-child(9)');
        if (actionCell) {
          actionCell.innerHTML = '<span class="badge badge-actioned">Yes</span>';
          break;
        }
      }
    }
    
    closeActionModal();
    
    // Reset form
    document.getElementById('adjustmentValue').value = '';
    document.getElementById('actionNotes').value = '';
  }
  
  // Suppress Modal
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
    
    // In a real implementation, this would send data to the server
    console.log('Suppression submitted:', {
      itemId,
      suppressReason,
      suppressDuration,
      suppressNotes,
      timestamp: new Date().toISOString()
    });
    
    // Mock update UI to show suppressed
    const rows = document.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
      const firstCell = rows[i].querySelector('td:first-child');
      if (firstCell && firstCell.textContent.includes(itemId)) {
        const actionCell = rows[i].querySelector('td:nth-child(9)');
        if (actionCell) {
          actionCell.innerHTML = '<span class="badge badge-suppressed">Suppressed</span>';
          break;
        }
      }
    }
    
    closeSuppressModal();
    
    // Reset form
    document.getElementById('suppressNotes').value = '';
  }
  