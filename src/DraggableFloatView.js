import React, { useRef } from 'react';
import { Animated ,PanResponder,Dimensions} from 'react-native';
const Window = Dimensions.get('window');
 

/*
    style目前支持{
        width:80,//至少是子视图大小
        height:80,//至少是子视图大小
        marginTop:80,//拖拽顶部距离
        marginBottom:80,//底部
        marginLeft:0,//左边
        marginRight:0,//右边
    }
    initX//初始x根据大小自动计算吸左吸右
    initY//初始y，不超过上下限即可。超过取最大或最小
*/
const DraggableFloatView = ({style,initX,initY,children}) => {
    let imgWith = 80;
    let imgHeight = 80;
    let top = 50;
    let left = 0;
    let bottom = 50;
    let right = 0;
    if(style){
        if(style.width>0&&style.height>0){
            imgWith = style.width;
            imgHeight = style.height;
        }
        if(style.marginTop>0&&style.marginTop<100){//不要设置过大top值没有意义
            top = style.marginTop;
        }
        if(style.marginLeft0&&style.marginLeft0<100){//不要设置过大top值没有意义
            left = style.marginLeft0;
        }
        if(style.marginBottom>0&&style.marginBottom<100){//不要设置过大top值没有意义
            bottom = style.marginBottom;
        }
        if(style.marginRight>0&&style.marginRight<100){//不要设置过大top值没有意义
            right = style.marginRight;
        }
       
    }
    const dragYMax = Window.height-imgHeight-bottom;
    const dragYMin = top;
    const dragXMax = Window.width-imgWith-right;
    const dragXMin = left;

    //默认位置吸右居中
    let defaultX = Window.width-imgWith-right;
    let defaultY = Window.height/2;

    if(initX<(Window.width - imgWith)/2){//初始X值小于屏幕一半，吸左
        defaultX = 0;
    }

    if(initY>0){
        defaultY = initY>dragYMax?dragYMax:initY;//超过下边界
        defaultY = initY<dragYMin?dragYMin:initY;
    }
    
    

    const pan = useRef(new Animated.ValueXY({x:defaultX,y:defaultY})).current;
    let location = {x:0,y:0};//记录滑动开始点
    let historyMove = {x:0,y:0};//记录滑动偏移量历史值
    const panResponder = useRef(
        PanResponder.create({
            // 单机手势是否可以成为响应者
            onStartShouldSetPanResponder: (evt, gestureState) => false,
            // 移动手势是否可以成为响应者
            onMoveShouldSetPanResponder: (event, gestureState) => {
                if (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2) {
                    return true
                } else {
                    return false;
                }
            },
            // 拦截子组件的单击手势传递,是否拦截
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            // 拦截子组件的移动手势传递,是否拦截
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                if (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2) {
                    return true
                } else {
                    return false;
                }
            },
            onPanResponderGrant: (evt, gestureState) => {
                
                //记录滑动开始位置
                location.x = gestureState.x0;
                location.y = gestureState.y0;
                historyMove.x = 0;
                historyMove.y = 0;
            },
            onPanResponderMove:(evt, gestureState) => {
                if(location.x!= gestureState.moveX&&location.y!= gestureState.moveY){
                    //记录运动起点
                    let finalX = pan.x._value;
                    let finalY = pan.y._value;

                    //计算本次偏移量，
                    let moveX = gestureState.moveX - location.x;
                    let moveY = gestureState.moveY - location.y;

                    //计算累计偏移量,本次偏移量-历史偏移量
                    let dx = moveX - historyMove.x;
                    let dy = moveY - historyMove.y;

                    historyMove.x = moveX;
                    historyMove.y = moveY;

                    //计算运动终点
                    finalX = pan.x._value + dx;
                    finalY = pan.y._value + dy;

                    // //验证边界
                    finalX = finalX>dragXMax?dragXMax:finalX;
                    finalX = finalX<dragXMin?dragXMin:finalX;

                    finalY = finalY>dragYMax?dragYMax:finalY;
                    finalY = finalY<dragYMin?dragYMin:finalY;

                    pan.setValue({
                        x:finalX,
                        y:finalY
                    })
                }
                
            },
            onPanResponderRelease: () => {
                //判断靠左还是靠右
                let finalX = pan.x._value;
                let finalY = pan.y._value;

                finalX = (finalX>(Window.width - imgWith)/2)?dragXMax:dragXMin;
                Animated.spring(
                    pan, 
                    { toValue: { x: finalX, y: finalY } }
                ).start();
            }
        })
    ).current;
    
    return (
        <Animated.View
        style={{
            position:'absolute',
            height: imgHeight,
            width: imgWith,
            backgroundColor:'transparent',
            left:pan.x,
            top:pan.y
        }}
        {...panResponder.panHandlers}
        >
            {children}
        </Animated.View>
    );
}

export default DraggableFloatView;