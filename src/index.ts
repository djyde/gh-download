import { Hono } from 'hono'
import yaml from 'yaml'
import { getDownloads } from './download'

const app = new Hono<{
  Bindings: {
    GH_TOKEN: string
  }
}>()

const allowedOwner = [
  'djyde'
]

app.get('/download/:owner/:repo/:platform/:arch', async (c) => {
  const { owner, repo, arch, platform } = c.req.param()

  if (!allowedOwner.includes(owner)) {
    return c.notFound()
  }

  try {
    const downloads = await getDownloads({
      owner,
      repo,
      ghToken: c.env.GH_TOKEN,
    })

    if (downloads) {
      const download = downloads.find((d) => d.platform === platform && d.arch === arch)
      if (download) {
        return c.redirect(download.link)
      }

      return c.notFound()
    }
  } catch (e) {
    console.error(e)
    return c.notFound()
  }
})

export default app
