# 演示地址

https://matsuzaka.top/uploads/saolei/index.html

基本完成扫雷玩法，注释完整



# 大致实现思路

### 一、生成一个长度为n的二维数组 -> 58行

```js
for (let i = 0; i < this.size; i++) {
	let arr = Array(this.size).fill(0)
}
```



### 二、生成两位随机数，对二维数组的一项进行替换，需要判重 -> 65行

```js
const createdSweeping = () => {
	let x = Math.floor(Math.random() * this.size)
	let y = Math.floor(Math.random() * this.size)
	// 如果与后续生成的重复了，则重新生成
	if (this.sweepingArr[x][y] !== 9) return this.sweepingArr[x][y] = 9
	createdSweeping()
}
```



### 三、初始化每一个雷周围的数字 -> 82行

- 先将雷周围的8项设置为1
- 然后遍历每一项，如果是雷，就让周围的8项+1
- 通过当前位置的`x-1，x，x+1` `y-1, y, y+1` `[x, y-1], [x, y+1]` 的方式获得周围8项



### 四、遍历二维数据，布局页面展示 -> 112行

- 生成之前先把游戏的容器内容清空（防止出现多次初始化，出现多个游戏）

- 在生成元素时，给元素绑定了``flag``属性，用于设置当前元素处于什么状态，例如

  - 0：初始值：未被点击（黄色小方块）

  - 1：已点击：白色空白方块 或 白色数字方块

  - 2：已标记：右键之后的标记（用于后续判断标记后能不能再左键点击）

    ```js
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
                    
    				newSDiv.flag = 0  // <----- 标记状态
                    
    				newSDiv.className = 'son'
    				newFDiv.appendChild(newSDiv)
    			}
    		}
    		// 初始化积分盘
    		this.signView.innerHTML = this.sweepingNumber
    }
    ```

    

### 五、给元素绑定点击事件 -> 133行

- 给二维数组外层绑定一次点击事件，设置为x
- 给二维数组中的每一项绑定点击事件，设置为y，就可以获取x与y的对应关系



#### 5.1 绑定左键事件 -> 173行

- 先判断游戏是否开启
- 左键后把flag标识设置为 1，**如果当前flag是2时不能设置**
- 再判断该位置对应的数字是否是9，**是9代表是炸弹，直接执行结束游戏的函数，并传入false**
- 再判断该位置对应的数字是否是0，**0需要对该周围所有的0一起消除**
- 再判断该位置对应的数字是否是9，**如果数字不是 9，则显示该数字**



#### 5.2 绑定右键事件 -> 139行

- 右键事件为：`contextmenu`

- 取消浏览器默认右键行为：`e.preventDefault()`

- 先判断游戏是否开启
- 判断已标记的数量是否大于总雷数量，大于等于后不进行标记
- **右键后把flag标志设置为2，需要判断该位置是否被打开(flag=0)，是否已被标记(flag=2)**
  - 如果被打开则中断操作
  - 如果被标记则取消标记，反之
    - 在标记中对已标记的数量进行+1
    - 在取消标记中对已标记的数量进行-1
  - 每次操作时，**判断所有雷是否都被标记，如果是则执行结束游戏函数，并传入true**



#### 5.3 绑定双击事件 -> 193行

双击效果：点击后，检测该位置周围的8个方块中是否无雷，或 是否雷全部被标记。如果符合条件则消除该8个方块内的所有方块

- 移动端的：`dblclick`事件
- 通过`x-1，x，x+1` `y-1, y, y+1` `[x, y-1], [x, y+1]` 方式对8个方向进行检测，将有雷的位置保存起来
- 通过`every`判断雷是否都被标记，如果都被标记，直接对8个方块执行`click()`



### 六、数字为0的位置进行连续消除 -> 237行

- 判断该方块的flag值不是2（2代表被右键标记），对应的数组位置是0（代表可以被连续消除），是白色背景
- 判断进入后直接切换背景颜色为白色
- 通过递归将每一个数字为0的进行消除



### 七、游戏结束 -> 270行

- 通过传递过来的 `true` 或 `false` 来决定游戏的结局

