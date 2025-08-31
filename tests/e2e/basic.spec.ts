import { expect, test } from '@playwright/test'

test.describe('Basic Application Tests', () => {
  test('health check endpoint works', async ({ request }) => {
    // Test the health check endpoint with retry logic
    let response

    // Retry up to 3 times with increasing delays
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await request.get('/api/health')
        if (response.status() === 200) {
          break // Success, exit retry loop
        }
        console.warn(`Attempt ${attempt}: Got status ${response.status()}`)
      }
      catch (error) {
        console.warn(`Attempt ${attempt}: ${error}`)
      }

      if (attempt < 3) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }

    // Ensure we have a response
    if (!response) {
      throw new Error('Failed to get response from health endpoint after 3 attempts')
    }

    // Assert the final response
    expect(response.status()).toBe(200)

    const health = await response.json()
    expect(health.status).toBe('ok')
    expect(health.timestamp).toBeDefined()
    expect(health.uptime).toBeGreaterThan(0)
  })

  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Check that we get some content
    await expect(page.locator('body')).not.toBeEmpty()

    // Check that the page has loaded (look for any text content)
    await expect(page.locator('body')).toContainText(/.*/)
  })
})
