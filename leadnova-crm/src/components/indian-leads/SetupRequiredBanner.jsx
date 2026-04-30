export default function SetupRequiredBanner({ onCheckAgain }) {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
      <h3 className="font-bold text-amber-900 text-lg">✅ Apify Free Tier Ready!</h3>
      <p className="text-amber-700 text-sm mt-2">
        Your Apify API key is configured. You get <strong>100 free leads per month</strong>.
      </p>
      <div className="bg-gray-900 text-green-400 rounded-xl p-4 mt-3 font-mono text-sm">
        <p className="text-white">Status: ✅ Ready to scrape</p>
        <p className="text-yellow-400 mt-1">Limit: 100 leads/month (Free Tier)</p>
      </div>
      <p className="text-xs text-amber-600 mt-3">
        💡 Need more leads? Upgrade to Apify Starter ($49/mo for 1,000 leads)
      </p>
      <button
        onClick={onCheckAgain}
        className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600"
      >
        🔄 Refresh Status
      </button>
    </div>
  )
}
