document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('mainTitle');
  const instructionMessage = document.getElementById('instructionMessage');
  const accountInfoDisplay = document.getElementById('accountInfoDisplay');
  const optionsContainer = document.getElementById('optionsContainer');
  const copyToClipboardButton = document.getElementById('copyToClipboardButton');
  const totalAmountDisplay = document.getElementById('totalAmountDisplay');
  const totalAmountSpan = document.getElementById('totalAmount');
  const simulateNfcScanButton = document.getElementById('simulateNfcScanButton');

  let currentArtistData = null;
  let totalAmount = 0;

  const urlParams = new URLSearchParams(window.location.search);
  const initialArtistId = urlParams.get('id') || 'example';
  fetchAccountNumber(initialArtistId);

  async function fetchAccountNumber(artistId) {
    if (!artistId) {
      accountInfoDisplay.textContent = '오류: 아티스트 ID가 제공되지 않았습니다.';
      accountInfoDisplay.style.display = 'block';
      return;
    }

    accountInfoDisplay.textContent = `정보 조회 중... (ID: ${artistId})`;
    accountInfoDisplay.style.display = 'block';
    optionsContainer.innerHTML = '';
    optionsContainer.style.display = 'none';
    copyToClipboardButton.style.display = 'none';
    instructionMessage.style.display = 'none';
    totalAmountDisplay.style.display = 'none';
    totalAmount = 0;
    totalAmountSpan.textContent = '0';

    try {
      const response = await fetch(`/api/getAccountNumber?id=${encodeURIComponent(artistId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP 오류! 상태: ${response.status}`);
      }

      const data = await response.json();
      currentArtistData = data;

      mainTitle.textContent = `${data.name || '아티스트'}@POCHI`;

      if (data.accountNumber) {
        accountInfoDisplay.innerHTML = `
          <p>계좌번호</p><h1>${data.accountNumber}</h1>
          <p>공지사항</p><h2>${data.announce || '없음'}</h2>
        `;
        accountInfoDisplay.style.display = 'block';
        instructionMessage.style.display = 'block';

        if (data.option) {
          const options = data.option.split(',').map(s => s.trim());
          const menus = (data.menu || '').split(',').map(s => s.trim());

          // Function to recalculate total amount
          const recalculateTotal = () => {
            totalAmount = 0;
            document.querySelectorAll('.option-item').forEach(item => {
              const amount = parseInt(item.dataset.amount, 10);
              const quantity = parseInt(item.querySelector('.quantity-display').textContent, 10); // Changed this line
              if (!isNaN(amount) && !isNaN(quantity) && quantity > 0) {
                totalAmount += amount * quantity;
              }
            });
            totalAmountSpan.textContent = totalAmount.toLocaleString();
          };

          options.forEach((opt, index) => {
            const amount = parseInt(opt.replace(/[^0-9]/g, ''), 10);
            if (isNaN(amount)) return; // Skip if amount is not a valid number

            const optionItem = document.createElement('div');
            optionItem.classList.add('option-item');
            optionItem.dataset.amount = amount;

            const menuText = menus[index] && menus[index].trim() !== '' ? `${menus[index]}` : '';
            const displayText = menuText ? `${menuText} - ${amount.toLocaleString()}원` : `${amount.toLocaleString()}원`;

            const amountLabel = document.createElement('span');
            amountLabel.classList.add('amount-label');
            amountLabel.textContent = displayText;

            const quantityControls = document.createElement('div');
            quantityControls.classList.add('quantity-controls');

            const minusButton = document.createElement('button');
            minusButton.classList.add('quantity-btn', 'minus-btn');
            minusButton.textContent = '-';

            const quantitySpan = document.createElement('span');
            quantitySpan.classList.add('quantity-display');
            quantitySpan.textContent = '0'; // Initial quantity

            const plusButton = document.createElement('button');
            plusButton.classList.add('quantity-btn', 'plus-btn');
            plusButton.textContent = '+';

            minusButton.addEventListener('click', () => {
                let currentQuantity = parseInt(quantitySpan.textContent, 10);
                if (currentQuantity > 0) {
                    quantitySpan.textContent = currentQuantity - 1;
                    recalculateTotal();
                }
            });

            plusButton.addEventListener('click', () => {
                let currentQuantity = parseInt(quantitySpan.textContent, 10);
                quantitySpan.textContent = currentQuantity + 1;
                recalculateTotal();
            });

            quantityControls.appendChild(minusButton);
            quantityControls.appendChild(quantitySpan);
            quantityControls.appendChild(plusButton);

            optionItem.appendChild(amountLabel);
            optionItem.appendChild(quantityControls);
            optionsContainer.appendChild(optionItem);
          });
          recalculateTotal(); // Initial calculation
          optionsContainer.style.display = 'flex';
          totalAmountDisplay.style.display = 'block';
          copyToClipboardButton.style.display = 'block';
        } else {
          copyToClipboardButton.textContent = '계좌번호 복사';
          copyToClipboardButton.style.display = 'block';
          optionsContainer.style.display = 'none';
          totalAmountDisplay.style.display = 'none';
        }

      } else {
        accountInfoDisplay.textContent = `오류: ${data.error || '정보를 찾을 수 없습니다.'}`;
        accountInfoDisplay.style.display = 'block';
      }
    } catch (error) {
      console.error('정보 조회 중 오류 발생:', error);
      accountInfoDisplay.textContent = `오류: ${error.message}`;
      accountInfoDisplay.style.display = 'block';
    }
  }

  copyToClipboardButton.addEventListener('click', () => {
    if (currentArtistData && currentArtistData.accountNumber) {
      let textToCopy = currentArtistData.accountNumber;
      if (totalAmount > 0) {
        textToCopy += ` ${totalAmount}원`;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('클립보드에 복사되었습니다: ' + textToCopy);
      }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사 실패!');
      });
    } else {
      alert('복사할 정보가 없습니다.');
    }
  });

  if (simulateNfcScanButton) {
    simulateNfcScanButton.addEventListener('click', () => {
      const simulatedArtistId = prompt('조회할 아티스트 ID를 입력하세요:');
      if (simulatedArtistId) {
        fetchAccountNumber(simulatedArtistId);
      }
    });
  }
});