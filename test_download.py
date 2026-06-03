import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

driver = webdriver.Chrome(options=options)
try:
    driver.get("http://localhost:3000/login")
    time.sleep(2)
    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("admin@finco.internal")
    driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("Admin@2026")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(3)
    
    driver.get("http://localhost:3000/documents")
    time.sleep(3)
    
    # Find all download buttons
    btns = driver.find_elements(By.CSS_SELECTOR, "button[title='Download']")
    if btns:
        btns[0].click()
        time.sleep(3)
    else:
        print("No download buttons found!")
        
    for entry in driver.get_log('browser'):
        print(f"[{entry['level']}] {entry['message']}")
        
finally:
    driver.quit()
