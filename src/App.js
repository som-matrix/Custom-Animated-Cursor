import React,{useState,useRef,useEffect,useCallback} from 'react'
import './App.css';
// Adding  all the eventListner and handler functionality
function useEventListner(eventName,handler,element=document){

  const saveHandler = useRef()

  useEffect(()=>{
    saveHandler.current = handler
  },[handler])

  useEffect(()=>{
    const isSupported = element && element.addEventListener
    if(!isSupported) return

    const eventListner = (event) => saveHandler.current(event)
    element.addEventListener(eventName,eventListner)
    return() =>{
      element.removeEventListener(eventName,eventListner)
    }
  },[eventName,element])
}
// Animated Cursor part
function AnimatedCursor({
  innerSize = 20,
  outerSize = 20,
  color = '220,90,90',
  outerAlpha = 0.4,
  innerScale = 0.7,
  outerScale = 5,
}){
  // Cursor refrences 
  const cursorOuterRef = useRef()
  const cursorInnerRef = useRef()
  const requestRef = useRef()
  const previousTimeRef = useRef()
  // Cursor States
  const [coords,setCoords] = useState({x:0,y:0})
  const [isVisible, setIsVisible] = useState(true)
  const [isActive,setIsActive] = useState(false)
  const [isActiveClickable,setIsActiveClickable] = useState(false)
  let endX = useRef(0)
  let endY = useRef(0)

  
  const onMouseMove = useCallback(({clientX,clientY})=>{
    setCoords({x:clientX,y:clientY})
    cursorInnerRef.current.style.top = clientY + 'px'
    cursorInnerRef.current.style.left = clientX + 'px'
    endX.current = clientX 
    endY.current = clientY  

  },[])
  // For animated outerCursor
  const animatedOuterCursor = useCallback((time)=>{

    if(previousTimeRef.current !== undefined){
      coords.x += (endX.current - coords.x) / 10
      coords.y += (endY.current - coords.y) / 10
      cursorOuterRef.current.style.top = coords.y + 'px'
      cursorOuterRef.current.style.left = coords.x + 'px'
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animatedOuterCursor)
  },[requestRef])

  useEffect(()=>{
    requestRef.current = requestAnimationFrame(animatedOuterCursor)
  },[animatedOuterCursor])

  const onMouseDown = useCallback(()=>{setIsActive(true)},[])
  const onMouseUp = useCallback(()=>{setIsActive(false)},[])
  const onMouseEnter = useCallback(()=>{setIsVisible(true)},[])
  const onMouseLeave = useCallback(()=>{setIsVisible(false)},[])

  // Calling useEventListener function
  useEventListner('mousemove',onMouseMove,document)
  useEventListner('mousedown',onMouseDown,document)
  useEventListner('mouseup',onMouseUp,document)
  useEventListner('mouseenter',onMouseEnter,document)
  useEventListner('mouseleave',onMouseLeave,document)
  
  // Cursor Active Effect
  useEffect(()=>{
    if(isActive){
      cursorInnerRef.current.style.transform = `scale(${innerScale})`
      cursorOuterRef.current.style.transform = `scale(${outerScale})`
    } else{
      cursorInnerRef.current.style.transform = `scale(1)`
      cursorOuterRef.current.style.transform = `scale(1)`
    }
  },[innerScale,outerScale,isActive])

  // Cursor activeClickable effect
  useEffect(()=>{
    if(isActiveClickable){
      cursorInnerRef.current.style.transform = `scale(${innerScale*1.3})`
      cursorOuterRef.current.style.transform = `scale(${outerScale*1.4})`
    }
  },[innerScale,outerScale,isActiveClickable])

  // Cursor visible effect
  useEffect(()=>{
    if(isVisible){
      cursorInnerRef.current.style.opacity = 1
      cursorOuterRef.current.style.opacity = 1
    } else{
      cursorInnerRef.current.style.opacity = 0
      cursorOuterRef.current.style.opacity = 0
    }
  },[isVisible])

  useEffect(()=>{

    const clickables = document.querySelectorAll('a ,  button , input , label, select')
    clickables.forEach((el)=>{
      el.style.cursor = 'none'

      el.addEventListener('mouseover',()=>{
        setIsActive(true)
      })
      el.addEventListener('click',()=>{
        setIsActive(true)
        setIsActiveClickable(false)
      })
      el.addEventListener('mousedown',()=>{
        setIsActiveClickable(true)
      })
      el.addEventListener('mouseup',()=>{
        setIsActive(true)
      })
      el.addEventListener('mouseout',()=>{
        setIsActive(false)
        setIsActiveClickable(false)
      })
    })
      return ()=>{
        clickables.forEach((el)=>{
          el.removeEventListener('mouseover',()=>{
            setIsActive(true)
          })
          el.removeEventListener('click',()=>{
            setIsActive(true)
            setIsActiveClickable(false)
          })
          el.removeEventListener('mousedown',()=>{
            setIsActiveClickable(true)
          })
          el.removeEventListener('mouseup',()=>{
            setIsActive(true)
          })
          el.removeEventListener('mouseout',()=>{
            setIsActive(false)
            setIsActiveClickable(false)
          })
        })
      }
  },[isActive])

  // Cursor Styles
  const styles = {
    cursor:{
      zIndex:999,
      position:'fixed',
      opacity:1,
      pointerEvents: 'none',
      transition: 'opacity 0.15s ease-in-out,transform 0.15s ease-in-out'
    },
    cursorInner: {
      position: 'fixed',
      borderRadius: '50%',
      width: innerSize,
      height: innerSize,
      pointerEvents: 'none',
      backgroundColor: `rgba(${color}, 1)`,
      transition: 'opacity 0.15s ease-in-out, transform 0.25s ease-in-out'
    },
    cursorOuter: {
      position: 'fixed',
      borderRadius: '50%',
      pointerEvents: 'none',
      width: outerSize,
      height: outerSize,
      backgroundColor: `rgba(${color}, ${outerAlpha})`,
      transition: 'opacity 0.15s ease-in-out, transform 0.25s ease-in-out'
    }
  }
  return(
    <React.Fragment>
      <div ref={cursorInnerRef} style={styles.cursorInner}></div>
      <div ref={cursorOuterRef} style={styles.cursorOuter}></div>
    </React.Fragment>
  )
}
 
function App(){

  return(
    <div className="App">
      <AnimatedCursor/>
      <section>
        <h1>Animated Cursor <br/>React Component</h1>
        <hr/>
        <p>An animated cursor component made as a <a href="App">Functional Component</a>, using <a href="App">React hooks</a> like <a href="App">useEffect</a> to handle event listeners, local state, an  <a href="App">RequestAnimationFrame</a> management.</p>
        <p>Hover over these <a href="App">links</a> and see how that animated cursor does it's thing. Kinda nifty, right? Not right for most things, but a nice move for more interactive-type projects. Here's another <a href="App">link to nowhere.</a></p>
        <p>Play with the <a href="App">css variables</a> to influence the cursor, cursor outline size, and amount of scale on target hover. I suppose those could all be <a href="App">props</a> with some. Click in the margin to check click animation.</p>
        <p>There's probably a better way to manage these kind of events, but this was the best I could come up with. Recently started mucking more with React cause I'm down with the simplicity of Functional Components and Hooks. And if you read the docs, the future ain't class components. So, best get on them functions.</p>
        
      </section>
    </div>
  )
}
export default App