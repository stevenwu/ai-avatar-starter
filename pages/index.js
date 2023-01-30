import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import buildspaceLogo from '../assets/buildspace-logo.png'

const Home = () => {
  const maxRetries = 20
  const [input, setInput] = useState('')
  const [img, setImg] = useState('')
  const [retry, setRetry] = useState(0)
  const [retryCount, setRetryCount] = useState(maxRetries)
  const [finalPrompt, setFinalPrompt] = useState('')
  const onChange = (evt) => setInput(evt.target.value)
  const [isGenerating, setIsGenerating] = useState(false)
  const generateAction = async () => {
    console.log('Generating...')
    if (isGenerating && retry === 0) return
    setIsGenerating(true)
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0
        } else {
          return prevState - 1
        }
      })

      setRetry(0)
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    })
    const data = await response.json()

    if (response.status === 503) {
      console.log('Model is loading...', data.estimated_time)
      setRetry(data.estimated_time)
      return
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`)
      setIsGenerating(false)
      return
    }
    setFinalPrompt(input)
    setInput('')
    setImg(data.image)
    setIsGenerating(false)
  }

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`
        )
        setRetryCount(maxRetries)
        return
      }

      console.log(`Trying again in ${retry} seconds.`)

      await sleep(retry * 1000)

      await generateAction()
    }

    if (retry === 0) {
      return
    }

    runRetry()
  }, [retry])

  return (
    <div className='root'>
      <Head>
        <title>Photorealistic Avatar Generator | buildspace</title>
      </Head>
      <div className='container'>
        <div className='header'>
          <div className='header-title'>
            <h1>Generate Realistic Profile Pictures</h1>
          </div>
          <div className='header-subtitle'>
            <h2>Need a new profile picture? We're here to help.</h2>
          </div>
          <div className='prompt-container'>
            <input className='prompt-box' value={input} onChange={onChange} />
            <div className='prompt-buttons' onClick={generateAction}>
              <a
                className={
                  isGenerating ? 'generate-button loading' : 'generate-button'
                }
              >
                <div className='generate'>
                  {isGenerating ? (
                    <span className='loader'></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className='output-content'>
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className='badge-container grow'>
        <a
          href='https://buildspace.so/builds/ai-avatar'
          target='_blank'
          rel='noreferrer'
        >
          <div className='badge'>
            <Image src={buildspaceLogo} alt='buildspace logo' />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  )
}

export default Home
