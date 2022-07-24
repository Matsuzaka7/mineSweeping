window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
})
class mineSweeping {
	// game 游戏是否开始
	// size 容器大小（n*n)
	// sweepingNumber 雷的个数
	// signSweepingNumber 标记正确的雷的个数
	// signNumber 标记的个数（用于判断标记不能大于雷的个数，规则）
	// signView 标记剩余个数显示的容器
	// sweepingArr 装雷的容器（二维数组）
	// sweepingView 游戏容器
	// sweepingItemAll 游戏初始化时生成的每一行
	// 		注意：每一个方块内有一个flag属性，0代表未选择（默认值），1代表已左键查看，2代表已右键标记
	// timer 游戏计时器
	// timerView 显示时间的容器

	constructor(size = 10, sweepingNumber = 10, el = '#gameBox', timerView = '#timer', signView = '#flag') {
		this.game = false
		this.size = size
		this.sweepingNumber = sweepingNumber
		this.signSweepingNumber = 0
		this.signNumber = 0
		this.signView = document.querySelector(signView)
		this.sweepingArr = []
		this.sweepingView = document.querySelector(el)
		this.sweepingRowAll = []
		this.timer = null
		this.timerView = document.querySelector(timerView)
		this.init()
	}

	// 用于初始化的函数
	init() {
		this.game = true
		this.clearTimerOut()
		// 初始化雷的位置
		this.initSweepingArr()
		// 初始化雷周边数字
		this.initPeriphery()
		// 初始化布局
		this.initGameView()
		// 绑定点击事件
		this.addClick()
		// 游戏计时
		this.timeOut()
	}

	// 游戏计时
	timeOut() {
		let i = 0
		this.timer = setInterval(() => {
			this.timerView.innerText = ++i
		}, 1000)
	}

	// 生成雷，传入 sweepingArr 的数组中，是一个二维数组
	initSweepingArr() {
		// 生成元素为0的二维数组
		for (let i = 0; i < this.size; i++) {
			this.sweepingArr[i] = Array(this.size).fill(0)
		}

		// 随机生成雷，替换原来的0
		const createdSweeping = () => {
			let x = Math.floor(Math.random() * this.size)
			let y = Math.floor(Math.random() * this.size)
			// 如果与后续生成的重复了，则重新生成
			if (this.sweepingArr[x][y] !== 9) return this.sweepingArr[x][y] = 9
			createdSweeping()
		}

		// 判断尺寸计算雷最大数
		if(this.sweepingNumber > this.size*this.size) this.sweepingNumber = this.size*this.size
		// 生成雷的个数
		for (let i = 0; i < this.sweepingNumber; i++) {
			createdSweeping()
		}
	}

	// 初始化雷周围的个数
	initPeriphery() {
		// 给雷周围的所有数+1
		const plus = (array, x, y) => {
			if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
				if (array[x][y] !== 9) array[x][y] += 1
			}
		}

		const isPeriphery = () => {
			// 循环每一项
			for (let x = 0; x < this.sweepingArr.length; x++) {
				for (let y = 0; y < this.sweepingArr[0].length; y++) {
					// 如果是雷就遍历雷周围的8个方块，让数字+1
					if (this.sweepingArr[x][y] === 9) {
						// 上下 6 个
						for (let i = -1; i < 2; i++) {
							plus(this.sweepingArr, x - 1, y + i)
							plus(this.sweepingArr, x + 1, y + i)
						}
						// 左右 2 个
						plus(this.sweepingArr, x, y + 1)
						plus(this.sweepingArr, x, y - 1)
					}
				}
			}
		}
		isPeriphery()
	}

	// 初始化布局
	initGameView() {
		this.sweepingView.innerHTML = ''
		const sweepingView = this.sweepingView
		for (let i = 0; i < this.sweepingArr.length; i++) {
			let newFDiv = document.createElement('div')
			newFDiv.className = 'father'
			sweepingView.appendChild(newFDiv)

			for (let j = 0; j < this.sweepingArr[i].length; j++) {
				let newSDiv = document.createElement('div')
				newSDiv.flag = 0 // flag是自定义属性，用于后续左键、右键的区分
				newSDiv.className = 'son'
				// newSDiv.innerHTML = this.sweepingArr[i][j]
				newFDiv.appendChild(newSDiv)
			}
		}
		// 初始化积分盘
		this.signView.innerHTML = this.sweepingNumber
	}

	// 点击小方块
	addClick() {
		this.sweepingRowAll = document.querySelectorAll('.father')
		// 遍历每一行
		for (let x = 0; x < this.sweepingRowAll.length; x++) {
			// 遍历每一行中的每一个单元格
			for (let y = 0; y < this.sweepingRowAll[x].children.length; y++) {
				// 右键
				this.sweepingRowAll[x].children[y].addEventListener('contextmenu', (e) => {
					//取消默认的浏览器自带右键
					e.preventDefault();
					// 游戏结束禁止后续
					if (!this.game) return
					// 标记个数不能大于雷的个数
					if(e.target.innerText !== '标' && this.signNumber >= this.sweepingNumber) return 
					// 只能标记flag为0的
					if (e.target.innerText !== '标' && this.sweepingRowAll[x].children[y].flag !== 0) return
					// 有数字的不能标记
					let flag = this.sweepingRowAll[x].children[y].flag
					// 取反
					if (flag === 0) {
						this.signNumber++
						this.signView.innerHTML = this.sweepingNumber - this.signNumber
						this.sweepingRowAll[x].children[y].flag = 2
						this.sweepingRowAll[x].children[y].innerText = '标'
					}
					if (flag === 2) {
						this.signNumber--
						this.signView.innerHTML = this.sweepingNumber - this.signNumber
						this.sweepingRowAll[x].children[y].flag = 0
						this.sweepingRowAll[x].children[y].innerText = ''
					}
					// 标记雷 与 取消标记雷
					if(this.sweepingArr[x][y]===9 && this.sweepingRowAll[x].children[y].innerText === '标') this.signSweepingNumber++
					if(this.sweepingArr[x][y]===9 && this.sweepingRowAll[x].children[y].innerText === '') this.signSweepingNumber--
					
					// 判断所有雷是否已标记，全部标记则结束游戏
					if(this.signSweepingNumber === this.sweepingNumber) return this.gameOver(true)
				})

				// 左键
				this.sweepingRowAll[x].children[y].addEventListener('click', (e) => {
					// 游戏结束、flag标记为2时，禁止左键
					if (!this.game) return
					if (this.sweepingRowAll[x].children[y].flag === 2) return
					// 左键后把flag变为1
					this.sweepingRowAll[x].children[y].flag = 1
					// 点到炸弹
					if (this.sweepingArr[x][y] === 9) return this.gameOver(false)
					// 点到空白，把周围的空白消除
					if (this.sweepingArr[x][y] === 0) return this.makeWhite(x, y)
					// 点到数字，显示数字
					if (this.sweepingArr[x][y] !== 9 && this.sweepingArr[x][y] !== 0) {
						this.sweepingRowAll[x].children[y].className = `son num${this.sweepingArr[x][y]}`
						this.sweepingRowAll[x].children[y].innerText = this.sweepingArr[x][y]
					}
				})
				
				// 双击清除周围8格已确定的雷之外的格子
				this.sweepingRowAll[x].children[y].addEventListener('dblclick', (e) => {
					// 边界处理
					try{
						// 周围8格有雷的坐标
						let side8 = []
						if(this.sweepingArr[x - 1][y + 1] === 9 && 	this.sweepingRowAll[x - 1]?.children[y + 1]?.innerText !== '标') side8.push([x - 1, y + 1])
						if(this.sweepingArr[x - 1][y - 1] === 9 && 	this.sweepingRowAll[x - 1]?.children[y - 1]?.innerText !== '标') side8.push([x - 1, y - 1])
						if(this.sweepingArr[x - 1][y] === 9 && 	this.sweepingRowAll[x - 1]?.children[y]?.innerText !== '标') side8.push([x - 1, y])
						if(this.sweepingArr[x + 1][y + 1] === 9 && 	this.sweepingRowAll[x + 1]?.children[y + 1]?.innerText !== '标') side8.push([x + 1, y + 1])
						if(this.sweepingArr[x + 1][y - 1] === 9 && 	this.sweepingRowAll[x + 1]?.children[y - 1]?.innerText !== '标') side8.push([x + 1, y - 1])
						if(this.sweepingArr[x + 1][y] === 9 && 	this.sweepingRowAll[x + 1]?.children[y]?.innerText !== '标') side8.push([x + 1, y + 1])
						if(this.sweepingArr[x][y + 1] === 9 && 	this.sweepingRowAll[x]?.children[y + 1]?.innerText !== '标') side8.push([x, y + 1])
						if(this.sweepingArr[x][y - 1] === 9 && 	this.sweepingRowAll[x]?.children[y - 1]?.innerText !== '标') side8.push([x, y - 1])
						
						// 周围八格的雷是否都被标记
						const everyF = side8.every(item => {
							return this.sweepingRowAll[item[0]].children[item[1]].innerText === '标'
						})
						
						if(everyF) {
							this.sweepingRowAll[x - 1]?.children[y + 1]?.click()
							this.sweepingRowAll[x - 1]?.children[y - 1]?.click()
							this.sweepingRowAll[x - 1]?.children[y]?.click()
							this.sweepingRowAll[x + 1]?.children[y + 1]?.click()
							this.sweepingRowAll[x + 1]?.children[y - 1]?.click()
							this.sweepingRowAll[x + 1]?.children[y]?.click()
							this.sweepingRowAll[x]?.children[y + 1]?.click()
							this.sweepingRowAll[x]?.children[y - 1]?.click()
						}
					}catch(e){}
				})
			}
		}
	}

	// 扫描单元格周围的8个单元格进行消除白色
	showNoMine(x, y) {
		this.makeWhite(x - 1, y + 1)
		this.makeWhite(x - 1, y - 1)
		this.makeWhite(x - 1, y)
		this.makeWhite(x + 1, y + 1)
		this.makeWhite(x + 1, y - 1)
		this.makeWhite(x + 1, y)
		this.makeWhite(x, y + 1)
		this.makeWhite(x, y - 1)
	}

	makeWhite(x, y) {
		// 边界处理
		if (x < this.size && y < this.size && x >= 0 && y >= 0) {
			let el = this.sweepingRowAll[x].children[y]
			
			// 只有不是白色的、数组该位置是0的、单元格标记不是2的才能进行白色消除
			if (el.style.background !== 'white' && this.sweepingArr[x][y] === 0 && el.flag !== 2) {
				el.style.background = 'white'
				if (el.innerText === '') return this.showNoMine(x, y)
			}

			// 处理'0'之外的一层的显示
			if (el.style.background !== 'white' && this.sweepingArr[x][y] === 1) {
				el.flag = 1; el.className = 'son num1'; el.innerText = 1
			}
			if (el.style.background !== 'white' && this.sweepingArr[x][y] === 2) {
				el.flag = 1; el.className = 'son num2'; el.innerText = 2
			}
			if (el.style.background !== 'white' && this.sweepingArr[x][y] === 3) {
				el.flag = 1; el.className = 'son num3'; el.innerText = 3
			}
			if (el.style.background !== 'white' && this.sweepingArr[x][y] === 4) {
				el.flag = 1; el.className = 'son num4'; el.innerText = 4
			}
		}
	}

	// 额外的清除定时器
	clearTimerOut(){
		clearInterval(this.timer)
	}

	// 游戏结束
	gameOver(flag) {
		this.game = false
		this.clearTimerOut()
		if (flag) {
			/* let f = confirm('找到所有雷，是否上传成绩')
			if(f) {
				 let name = prompt('请输入昵称')
			} */
			alert('已找到所有雷 恭喜你')
			
		}
		if (!flag) {
			alert(`大失败，只找到 ${this.signSweepingNumber} 个雷`)
			// 显示所有雷
			for (let x = 0; x < this.sweepingArr.length; x++) {
				// 遍历每一行中的每一个单元格
				for (let y = 0; y < this.sweepingArr[x].length; y++) {
					// 找出所有雷
					if (this.sweepingArr[x][y] === 9) {
						let fn = () => {
							this.sweepingRowAll[x].children[y].style.color = 'red'
							// 如果雷被标记了，就不替换文本
							if (this.sweepingRowAll[x].children[y].innerText === '标') return
							this.sweepingRowAll[x].children[y].innerText = '×'
						}
						setTimeout(fn, 45 * x)
						// requestAnimationFrame(fn)
					}
				}
			}
		}
	}
}
