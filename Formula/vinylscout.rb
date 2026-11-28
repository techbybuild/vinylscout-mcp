class Vinylscout < Formula
  desc "Query Dutch vinyl prices, deals, and turntables from Vinylscout"
  homepage "https://vinylscout.nl/cli"
  url "https://github.com/techbybuild/vinylscout-mcp/releases/download/cli-v1.0.0/techbybuild-vinylscout-1.0.0.tgz"
  sha256 "a7e9bcab2ba1f7245682c28d37975553d3eaba10bd2275d571b04150fd08004e"
  license "MIT"

  depends_on "node"

  def install
    libexec.install "bin/vinylscout.mjs"
    bin.install_symlink libexec/"vinylscout.mjs" => "vinylscout"
  end

  test do
    assert_match "Usage: vinylscout", shell_output("#{bin}/vinylscout --help")
  end
end
