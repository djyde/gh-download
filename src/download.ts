import YAML from 'yaml'
export async function getDownloads(config: {
  owner: string,
  repo: string,
  fallbackVersion?: string
  ghToken: string,
}) {
  try {
    const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/releases/latest`, {
      headers: {
        Authorization: `Bearer ${config.ghToken}`,
        Accept: "application/vnd.github+json",
        'User-Agent': 'gh-downloader'
      }
    })

    const data = await response.json() as {
      tag_name: string,
      assets: {
        browser_download_url: string,
        name: string
      }[]
    }
    const latestYML = data.assets.find(asset => asset.name === 'latest.yml')?.browser_download_url
    const latestYMLMac = data.assets.find(asset => asset.name === 'latest-mac.yml')?.browser_download_url

    if (latestYML && latestYMLMac) {
      const latestYMLContent = await (await fetch(latestYML)).text()
      const latestYMLMacContent = await (await fetch(latestYMLMac)).text()


      const win = YAML.parse(latestYMLContent)
      const mac = YAML.parse(latestYMLMacContent)

      const downloadLink = (version: string, fileName: string) => `https://release.randynamic.org/${config.owner}/${config.repo}/releases/download/v${version}/${fileName}`

      const macVersion = mac.version
      const intel = mac.path
      const arm = mac.files.find((file: any) => file.url.endsWith('-arm64-mac.zip')).url

      const winVersion = win.version
      const win64 = win.path

      const downloads = [
        {
          platform: 'win',
          arch: 'x64',
          link: downloadLink(winVersion, win64)
        },
        {
          platform: 'mac',
          arch: "intel",
          link: downloadLink(macVersion, intel)
        },
        {
          platform: 'mac',
          arch: "arm",
          link: downloadLink(macVersion, arm)
        }
      ]

      return downloads
    }
    throw new Error("No latest.yml found")
  } catch (e) {
    console.log(e)
    return null
  }
}
