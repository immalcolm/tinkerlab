from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageOps,ImageDraw
from collections import Counter
import json
P=Path(__file__).parent;html=(P/'index.html').read_text()
results=[];errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader'])
 page=browser.new_page(viewport={'width':540,'height':960},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load')
 page.evaluate('document.querySelector("#mute").click()')
 page.wait_for_timeout(250)
 page.screenshot(path=str(P/'preview_idle.png'))
 assert page.locator('html').get_attribute('data-state')=='idle'
 page.locator('#start').click(); page.locator('#start').click(force=True)
 assert page.evaluate('window.__techDropQA.snapshot().round')==1
 page.wait_for_timeout(1700)
 assert page.locator('html').get_attribute('data-state')=='playing'
 page.screenshot(path=str(P/'preview_playing.png'))
 page.wait_for_timeout(3380)
 assert page.locator('html').get_attribute('data-state')=='capture'
 page.screenshot(path=str(P/'preview_capture.png'))
 page.wait_for_timeout(3200)
 assert page.locator('html').get_attribute('data-state')=='result'
 page.screenshot(path=str(P/'preview_result.png'))
 page.wait_for_timeout(5400)
 assert page.locator('html').get_attribute('data-state')=='idle'
 page.keyboard.press('Space');page.wait_for_timeout(700)
 assert page.locator('html').get_attribute('data-state') in ('launch','playing')
 page.evaluate('window.__techDropQA.reset()');page.keyboard.press('Enter');page.wait_for_timeout(100)
 assert page.locator('html').get_attribute('data-state')=='launch'
 print('FULL ROUND + RESET, keyboard Space/Enter, duplicate protection: PASS')
 # Six force-landing screens, plus trajectory fidelity and text, with time for title animation to settle.
 for n in range(6):
  page.evaluate('window.__techDropQA.reset()');page.evaluate('(n)=>window.__techDropQA.forceOutcome(n)',n)
  assert page.evaluate('window.__techDropQA.start()')==True
  snap=page.evaluate('window.__techDropQA.snapshot()')
  assert abs(snap['landingX']-snap['expectedX'])<=36.5, snap
  assert snap['impacts']>=3,snap
  page.evaluate('window.__techDropQA.skip()');page.evaluate('window.__techDropQA.skip()')
  page.wait_for_timeout(980)
  text=page.locator('#resultTitle').text_content()
  assert page.locator('html').get_attribute('data-state')=='result'
  assert text and len(text)>5
  page.screenshot(path=str(P/f'outcome_{n}.png'))
  results.append({'index':n,'name':text,'impacts':snap['impacts'],'landing_error_px':round(abs(snap['landingX']-snap['expectedX']),1)})
 print('SIX OUTCOMES:',json.dumps(results))
 # Exhaustive 60 deterministic rounds (rapid start/reset). Check lane and collision count.
 misses=0;hit_min=1000;hit_max=0
 for n in range(60):
  page.evaluate('window.__techDropQA.reset()');page.evaluate('(n)=>window.__techDropQA.forceOutcome(n)',n%6)
  page.evaluate('window.__techDropQA.start()');snap=page.evaluate('window.__techDropQA.snapshot()')
  if abs(snap['landingX']-snap['expectedX'])>36.5:misses+=1
  hit_min=min(hit_min,snap['impacts']);hit_max=max(hit_max,snap['impacts'])
 assert misses==0, f'{misses} missed outcome bins'
 print('SIMULATED ROUNDS:',60,'misses:',misses,'peg impact range:',(hit_min,hit_max))
 for w,h,name in [(390,844,'phone'),(360,640,'small_phone'),(1080,1920,'kiosk'),(1280,720,'landscape')]:
  t=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=True,is_mobile=name in ['phone','small_phone'])
  t.on('pageerror',lambda e:errors.append(name+':'+str(e)))
  t.set_content(html,wait_until='load');t.wait_for_timeout(120);t.screenshot(path=str(P/f'preview_{name}.png'))
  rect=t.locator('#stage').bounding_box()
  assert rect['x']>=-0.2 and rect['y']>=-0.2 and rect['width']<=w+.2 and rect['height']<=h+.2,rect
  if name=='phone': t.locator('#start').tap();assert t.locator('html').get_attribute('data-state')=='launch'
  if name=='kiosk':
   dimensions=t.evaluate('({canvasW:document.querySelector("canvas").width,canvasH:document.querySelector("canvas").height})')
   print('KIOSK canvas:',dimensions)
   assert dimensions['canvasW']>=1080
  t.close()
 print('RESPONSIVE:', 'phone, small phone, portrait kiosk, landscape PASS')
 print('JAVASCRIPT ERRORS:',errors)
 assert not errors
 browser.close()
# Contact sheet of all six tech results: 3 columns, 2 rows
thumbs=[]
for i in range(6):
 im=Image.open(P/f'outcome_{i}.png').convert('RGB');im.thumbnail((270,480));thumbs.append(im)
sheet=Image.new('RGB',(270*3,480*2),(4,8,21))
for i,im in enumerate(thumbs):sheet.paste(im,((i%3)*270,(i//3)*480))
sheet.save(P/'all_six_superpowers.jpg',quality=89)
print('Screenshots and contact sheet saved.')
