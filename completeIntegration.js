/**
 * 整合增強版機率計算器到遊戲中
 * 這個腳本會在頁面加載後替換原始的機率計算器
 */

// 等待頁面完全加載
window.addEventListener('load', function() {
    console.log('正在整合增強版機率計算器...');
    
    try {
        // 檢查原始機率計算器是否已加載
        if (typeof ProbabilityCalculator === 'undefined') {
            throw new Error('原始機率計算器未加載');
        }
        
        // 加載增強版機率計算器
        const script = document.createElement('script');
        script.src = 'probabilityCalculator.enhanced.js';
        script.onload = function() {
            console.log('增強版機率計算器已加載');
            
            // 重新初始化遊戲
            if (typeof initializeGame === 'function') {
                console.log('重新初始化遊戲以使用增強版機率計算器');
                initializeGame();
                
                // 如果遊戲已經開始，則更新建議
                if (gameState && gameState.gameStarted && !gameState.gameEnded) {
                    if (gameState.gamePhase === 'player-turn') {
                        showPlayerSuggestion();
                    }
                }
                
                // 顯示成功訊息
                const instructionText = document.getElementById('instruction-text');
                if (instructionText) {
                    const originalText = instructionText.textContent;
                    instructionText.textContent = '增強版機率計算器已成功整合！' + originalText;
                    instructionText.classList.add('success');
                    
                    // 3秒後恢復原始文字
                    setTimeout(() => {
                        instructionText.textContent = originalText;
                        instructionText.classList.remove('success');
                    }, 3000);
                }
            } else {
                console.error('找不到 initializeGame 函數');
            }
        };
        
        script.onerror = function() {
            console.error('加載增強版機率計算器失敗');
            alert('加載增強版機率計算器失敗，將繼續使用原始版本');
        };
        
        document.body.appendChild(script);
        
    } catch (error) {
        console.error('整合增強版機率計算器時發生錯誤:', error);
        alert('整合增強版機率計算器失敗: ' + error.message);
    }
});