import { useState } from 'react'
import { Delete } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAABCmlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGAyYAACJgEGhty8kqIgdyeFiMgoBQYkkJhcXMCAGzAyMHy7BiIZGC7r4lGHC3CmpBYnA+kPQFxSBLQcaGQKkC2SDmFXgNhJEHYPiF0UEuQMZC8AsjXSkdhJSOzykoISIPsESH1yQRGIfQfIDsnNKU1GuJuBJzUvNBhIRwCxDEMxQxCDO4MTGX7ACxDhmb+IgcHiKwMD8wSEWNJMBobtrQwMErcQYipAP/C3MDBsO1+QWJQIFmIBYqa0NAaGT8sZGHgjGRiELzAwcEVj2oGICxx+tQD71Z0hHwjTGXIYUhkUGDwZ8hiSGfSALCMGAwZDBjNcfgEAsp9A2ZPrFzMAABETSURBVHic7dzZcxvXlcfx3zm3GwCxECTAVbQki7Ekx6nETuxkJjWP85K/NVV5n3mY90lVkknFsR1HiiJZC0VSBLEDvdxz5qEbJGXpykmsWIRyPqWyDBECIPQXvdy+DdJf/grGvAy/6RdgLi+LwwRZHCbI4jBBFocJsjhMkMVhgqKv3VZVkL6Rl2LeCAIB9NIffT0OkPzTX465VAjQl8dhmxUTZHH8ywusNmBxmFewOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCLA4TZHGYIIvDBFkcJsjiMEEWhwmyOEyQxWGCli4OVegrfopX/fQ1vYLnb6n+05/xTYne9Av4OylIFQRSPQ+7XDr0tduiSswAvd5iSJUIAEFVASL6xr+ypJYmDgIE8Mx5FLFAoapSrkdIFYCCqagGzBGIVDXOMyLQa+lDiUhFNYGCIhAUykBFlFTxNiayNHEoICq63kF3wzNVWi2qN0RB5aZksWwIyDPfH/gs5yTJnxzEPldSeg3rDvXQLIrpg1tRZwvqwSzj8fQPn9aT5PX0d8ksTRwoVuCDPg1HcNGs3ap/9GG81il+dLZYCDL+42e4/4DzHKqsOVQJ3/ZjrQQl1dznq+uN/X1UVopndN2N/MmBfPUgiiIFCYHfokKWaYeUQZFIJc9ryTw+OEwfPYKqqEKVVEkVqn4ywf1H9eGwmiVxnrIIvZaPtBKBPNTt7SCuQZTUw+fEzFsbnmMolIC3a+2xTHEAIDCIlMkRZZOJkIIURMUvJeI0r6jXyJW3lYBvu+JQgkJVRGp1XltDmQoRswDR9nbWrHtVUmX91uuoy2TJ4gBwtrRJwQpSFAe3Zx9dgUCJlAqv4RkVDIgCrVYyHPn5DAQIAcRA1Gy5jQ1RXcY389WW9d9TLHN97lb5v0RlPK/z+VTERa7doqeH1B8Uj05Eqgp2bmvLu1j1dT/pm7ascQAAUXGs8rzFoNTrOD6Bnlfo63WJIjo5yU97hHI1RSCFuq1N32qJ+Ldrl2MJ49Dyv+VnlBafVlIUy0yZLt7hWz0XQaAKZCLcWdN5EqWp9AeSZ+evQsH1htvoqOoi1rckkeWL4xstdkpey5pDiIijCJUaalWc9mPH0uvRbEpE550SRbs7vlI5C/U1PPUl8BbG8Ro/uOyicZb/+fHjpLHCIjQakiM3n/njk/OnIUCV1zu+vaZe3qaR0uWOg0BnOxdnexrFPseLy+hs7/XV7SgVZ9M8mPpJcr/fe3hynDebMplGIkRMeZ6f9CDnGy5V5foKbXTychyfXrryUEBViEiJoAoIIP/Qv/s7stxx6OI3VS2rCC/5RUflcJkGPuMsUIA57k1mzybTiOj27febrVV/2idiKEXk5PjYj8cEwuKUrCoqV7bzSuQVUH7xdSgpibCL7x0d9yZjcvzK08uXwnLHUShHpIi/cYhSAVUlF2XM8zz3L7uzV2Hnns3noyyLnKtkur6zq1kaz6bEBFViceOxnvbOHhLFgEprVVur8EoqAH9t5UGi5NzDfn+e56uNpooq8SV//5fp3MpLladlRe7cvdtabW3HLjTwpSocRanK6XDwdDSsMt/evQLvL55QVVV2rp9mvckERJLMr27uRK2m7/WqqgCEhAAnPj06jq5fFRXmKMuzo+Pjx08eV0ejH1Zj8T7J8pgpWqxBFCDmfpqmaXb7yhUHKeYdfCfv0D/uUpf7MqQEqADFaXsp3uC79/5y0jvJRZhjqJyPlwIKlWKj47g3mT4+OZmKeNGNtfULp9oVEFVh58Z5/vjkRIDpcHh9cytqNcDOjafMjgCGFmP1/uSZTMbM0dHx0Z27d4ej0XyeXvvxj2YuenR6+ut7d8ZZSi5WIoEqu6GX3mSyvb6u4lPvMxRHvpfakq05tDxZUkSiTA7Ab/7vd6Ph8NbNm1vbOxgOF/dEuWepwlE8z31vOEqzbKe79eDZ4XqrsVFvaJ4QkYIJJKrMNE7TPx08qa7UI5XvX78WCZLmCs+mnCRwDADKCgVLdTqdHhwe8rGo7u/v3/nzndu3bq1vbnz629+NBoN2e+3ZYJwruUoExSyd//XRQwJGg4EolJjFv7O52V1tqcilTWSZ4lCARDMVYefBkyzL+/3f/+EP/cHgk49/sr29w84Vs/ZU1TkGKSkU0Wie9Cajelzdu7J59+DJPJ3f2rlOeQ4igEihpCBOwJ8/+Sr1frfZ2KrVI8icwGvrenAQF+OhzCAiEXDUG496X3zR/befbW7t/P7TTytRtL25CcDt7Jx+eeeD9tp4NMh8pU4Rouh0NLq1u9du1OC1WJewIgLgc6LLu/JejjiKDTezg2rmZZzMlVyS+f/57/+6eevWf/z853EclxN+qtU4ijnyw9nEi6c47s3nkzTdWe82qtGDQe/J4PT93b3xZJI7JqBOrhI5YsdR/MXjg0GWfbC7t1tvis9FNep0RNWNZ2AS6Hg2zcUjqgzTdDKbdXeubLRXP//Tl8dHxz/95OPT/uk0Sd1KY2tzq1mNb+y8J2nCceXwtN9eiTdW6iKe2AFSzioDLvlw2RLEoQQBROng+FmlVum0mlu1+sls9ujZ0b//7Gf7N/aL0+m9016a54MHD+TBV3WvOenD4+PpbHrj+rur1Vo2m301Tu48fNhttJ4cHR32Tyv1xrUrVxA7ERmOpw+eHZ0kyVqjSVAm5SgapvN+mm6ORpwkUnVZnj057X11dJyl/r3v7a/XanJ09Nn//vrz/uDKxuaXf/piNJl2uhudTptb9To5TTKP6M7jg4rjq9119Z6IFgMbLPrtpxL80y1DHCpRXP3s/v0p89ZK/YunB0maMXHnwx/u39gHkHv/2Reft9vtznpH2mu+0WiIVqq1WZLs7e93Gw1JU0RR/+now2s3rnXWIXr32fGzefLlg/sfXHv30dOTaLX9eDD43u4eQ8fz2bTZODw+HJJb27uazmdarxBFElc7V2rTuLrb2eyurOTI0zy/9+TJf/7iF931bvFSHz56NJwMv//xx+6PX47S5LPH9z30k2vXnUKe334sxUDqEsTByip+s90+HPSPDp9U6rWIiUHpdHZ0dJjkef+032y13r12HcDq3p7/yz2ezx4fH++urXbqK3mWsOOj4SCO+Gqn45N5Jpp5GcwmO91Ot1brXr3627/ee6fTeX9razif3nv4yJGLiPdv3Fq5ej3tPXPdDVVi9dlpb//KbqPeEO+jKDo5OtxdX++udXKRiPnp0eHJs2cfffSR7/f+MvnNrN9jpo+u36h5nwsxnx9ALYsliAME9bK12l5r1ud5VuWoulKfz+fj9vpwMlHQzZvv1SpVVSUin6eJZJUs2+12HLFknplVqbXSaLeams4ZrNBKXHmvs3l9vRMR7p8czsfjn3/046rIWrX6oxv7MRO5KF+tzx/91R2eMDshZZVtcjpNIMcMKKOVJFSpzR8/rL1zbTqbzmazW+/ffnr49PjwaXN7c3p6cq29VlMRhTs7x79UliEOgAH1eUTcimtQ1XkSKapxXGxWUIx7AijneBATF6MgxdlZIqw4BkAgYakw9rsdzfJktZln+W5rbe/DTedFVSKiyJFqnrgaVSvu6dNqlgLOFfMRNddivrKCiNYIyWwih0fYu5rMk4ODg+l0Gsfx7e9/0CNKHzzYXV/Ls9xd4uORV1uOOFBcPKQAVAhMpJlXiGiOcjogl6c5nj9ncj5aWl7hQqQMhaZp5kW7XT8crQwGpB4gYSIFlLwA7bamWTRPEBHKCxuKSYek0PIgWRETkpOezKZr6+s3b96s1WqtRvNk0H/QO/3B1Wt+cEq8JO/wyyxH1IvVArA4qVosdSYuyzgTmshRTDcGWIvVi4IjF1dZPKAKJoDL6UKqzNSqYzB0xSVtxRSicj6ROsApEYpZqg6joT/tAdjsbrQazSxNH97/6gef/LSysymivIRbkzPLEceLdJGBPj9T8Ox8PL2wVIqhVeHFFXJxFNdrUBTjYOd387mvt4iJJyOKuHgcWoRZhAJSkDKUmKIsz46OSNWLB3Dv3r1GY6XZaFB3w1eqgJelvWRhiVd6uhhG/7sOC+nsAkomVOPFTOTzFY6Qo9W2zhKXzvFNGwUligj++MRPptxsqOqVvb16fQUAb2wkrWbcOy3Wa8u4AlnWNcfzl03/TR9LvXhX5SyOtFJR0XI+yOJBvWNuruhg4P6GRyVVYqfDvvRPi1M5rVbLuUhV3UrDbW3lwPJuWZYvjnJ+KJWXq7xkxtdiQ0MXeijuqlQez2Qq2Nzk6kpxhqW8GklV8lxbDe9zTIv5OPSN6REoyn369OjCFfcKqALR9ravVOTipLGlsmxxlBcEQKFETEoKKQIoJngVBzVU1lPMpuGzvQanIFWf5UmzVbv5HqCUp0xMKM61akJOt7bYa5TnoOLY5uX7uIswSVgZSv0BsjnK+X/FAKhE3Q3pdtRnTC+fOHjJLVkcKiKaay4JqNLpgoqr0YpdPir2JURUvYjkIr785QW5SO5TL1NGur1Z/8mP3fq6z1JVURXxHl6y1Ker7cr1qyqiXtWr5uJFXjq0yQoIvIrmoqriM0mz88smlFUJlUrl3e/NKis+TwWydJuXZdohFajWG77eEEXc6VT3rgDKxYVF5SEIEcdY7yT1RrmGL457mYSJ44iarXi9XdneQnWl/MoPRVapSnuNBFqvNt7bd51N/848SzPJcy0OV8fTeD67uNurBBVk1aq0mgRS1vjqNbdSRznBqzyWAVB5Z5f04/ThA9fruTS99OfankP6y19dvK3wb+qlfCOvgrU1bbcVTHEFz3+5gpZDl4o8gyopg1Bs+8EEEDEocmBWURWAGJMRDg61WuWtLQCIHVykqgzVzKv6YpUh/X40GLiLi5Ugor7ZoE5XHJHCxRUhgqoSU5mdFMe+xKxpJodH8WTEl2+0lF6Y7nr+o2WJo3y/pZjNUxzEilA54EGLVf/iIkWGLqYKXvyHa3kpwNlAGnHxzRvFn2ox76fYZSj+siqYEeG5E6lKYIEXeFIuRl9VyqPk8gUUl+YTQYsrrpmYL+U3RL0ijqXZrGjxrU5c7FqSAoT47GiziEMBKiZMULF3Wn4Bw2KPkkCuvHM5a7y4WB7qynFTYLGrWX7jl0CJisk5z70aCIEcHJErHouis9k75R8Udyxe8ssuVrj8liYOlMueSGhxs/iUA4BQMcgNLLYlVH4mgAuL5XzTU4yxKml5XdTXFr0urrXlcrFeOGLRCx+0s5UFXfx2ssUlMgqloq1lPCe7THEsnL3NFzcZX7vaPrQkLg5kv+J7Gp7bu9Dz/776wV98vLM9omUsA0t3KGu+SxaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcZggi8MEWRwmyOIwQRaHCbI4TJDFYYIsDhNkcfzLIw39JHrhTxgI3tu8Raj8XSl0j6/HQaDzv2b+tdlmxQRZHCbI4jBBFocJsjhM0P8DsaZYYOHzp2MAAAAASUVORK5CYII="

export default function PinScreen() {
  const { checkPin, pinError } = useAuth()
  const [pin, setPin] = useState('')
  const [imgErr, setImgErr] = useState(false)

  async function press(d) {
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      const ok = await checkPin(next)
      if (!ok) setPin('')
    }
  }

  function del() { setPin(p => p.slice(0,-1)) }
  const keys = ['1','2','3','4','5','6','7','8','9','','0','x']

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-8 select-none">
      <div className="mb-8 text-center">
        <div className="w-32 h-32 rounded-full bg-rosa mx-auto flex items-center justify-center mb-4 overflow-hidden shadow-xl border-4 border-white/20">
          {imgErr
            ? <span className="font-serif text-4xl text-white font-semibold">LA</span>
            : <img src={LOGO} alt="logo" className="w-full h-full object-cover" onError={()=>setImgErr(true)}/>
          }
        </div>
        <h1 className="font-serif text-3xl text-white font-semibold">L-Ash Art</h1>
        <p className="text-ink-3 text-sm mt-1">Ingresa tu PIN para continuar</p>
      </div>

      <div className="flex gap-4 mb-10">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-150 ${
            i < pin.length ? 'bg-rosa scale-110' : 'bg-ink-2'
          }`}/>
        ))}
      </div>

      {pinError && <p className="text-danger text-sm mb-4 animate-pulse">PIN incorrecto</p>}

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {keys.map((k,i) => (
          <button key={i}
            onClick={() => k==='x' ? del() : k!=='' ? press(k) : null}
            disabled={k===''}
            className={`h-16 rounded-xl2 text-xl font-semibold transition-all active:scale-95 ${
              k==='' ? 'invisible' :
              k==='x' ? 'bg-transparent text-ink-3' :
              'bg-white/10 text-white hover:bg-white/20'
            }`}>
            {k==='x' ? <Delete className="mx-auto" size={22}/> : k}
          </button>
        ))}
      </div>
    </div>
  )
}
