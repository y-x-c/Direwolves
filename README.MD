# Direwolves

*协同 Markdown 编辑器，网络课程 PJ ，之后打算支持和印象笔记同步。*

### 预览

<img src="https://raw.githubusercontent.com/Orthocenter/Direwolves/master/demo/preview.gif">

### 传输协议定义

#### 总览
- 基于 `TCP` 。
- 协议支持 `Nagle` 算法，也就是说小的数据可以被整合到一个包里发送。
- 客户端和服务端通讯的基本单位称为*命令*。
- 传输于客户端和服务器之间的命令，内部用 `JSON` 表示，传输时传送字符串化后的 `JSON`。

#### 命令封装和传输
发送端将命令字符串化后，在其前面加上字符串的长度，两者用空格隔开。比如服务器发送这样一条命令：
```
{
    type: "ACK",
    version: 868
}
```
则它会被封装成
```
28 {"type":"ACK","version":868}
```
而后通过 `TCP` 传输。接收端收到命令后，放入 `buffer` 中。判断是否已经接受到了至少一条完整的命令，如果是就找到开头代表字符串长度的数字 *n* ，然后将空格之后 *n* 个字转换成 `JSON` 。之后重复上述过程直到 `buffer` 中没有完整的命令可读。

#### 已定义的命令
##### 客户端

- 加入某份文档的编辑
```
{
    type: "join",
    docid: "xxx"
}
```

- 退出编辑
```
{
    type: "end"
}
```

- 提交变更
```
{
    type: "submitChgset",
    chgset: "=cx-1=7||d",
    version: 666
}
```

##### 服务端

- 确认客户端加入
```
{
    type: "joined",
    version: 666,
    text: ""
}
```

- 确认用户提交的变更
```
{
    type: "ACK",
    version: 667
}
```

- 广播变更
```
{
    type: "broadcastChgset",
    chgset: "=cx-1=7||d",
    version: 667
}
```

### 还未加入的功能
- 各种 bug 没修，各种异常没有处理
- 同步到印象笔记做持久化
- 编辑器和 *markdown* 预览的位置还未同步
- 数学公式
- 粘贴插入图片
- ...

### License
2015 Yuxin Chen <chenyuxin.mail@gmail.com>

Direwolves is licensed under the MIT license.
