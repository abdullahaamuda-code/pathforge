import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_opportunity_desk():
    opportunities = []
    urls = [
        "https://opportunitydesk.org/category/fellowships-and-scholarships/",
        "https://opportunitydesk.org/category/fellowships/",
        "https://opportunitydesk.org/category/grants/",
    ]
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36"}

    for url in urls:
        opp_type = "fellowship"
        if "scholarship" in url:
            opp_type = "grant"
        elif "grant" in url:
            opp_type = "grant"

        try:
            res = requests.get(url, headers=headers, timeout=15)
            soup = BeautifulSoup(res.content, "html.parser")

            # Try multiple selectors
            items = (
                soup.select("article") or
                soup.select(".post") or
                soup.select(".entry") or
                soup.select("h2.entry-title") or
                soup.select(".td-block-span6")
            )

            for item in items[:15]:
                try:
                    # Find title and link
                    title_el = (
                        item.select_one("h3 a") or
                        item.select_one("h2 a") or
                        item.select_one("h1 a") or
                        item.select_one("a[rel='bookmark']") or
                        item.select_one("a")
                    )

                    if not title_el:
                        continue

                    title = title_el.get_text(strip=True)
                    link = title_el.get("href", url)

                    if not title or len(title) < 10:
                        continue

                    # Find excerpt
                    excerpt_el = item.select_one(".td-excerpt") or item.select_one("p")
                    excerpt = excerpt_el.get_text(strip=True)[:400] if excerpt_el else ""

                    # Detect countries from title
                    countries = []
                    title_lower = title.lower()
                    if any(w in title_lower for w in ["africa", "african"]):
                        countries = ["Africa"]
                    elif "nigeria" in title_lower:
                        countries = ["Nigeria"]
                    elif "global" in title_lower or "international" in title_lower or "worldwide" in title_lower:
                        countries = ["Global"]
                    else:
                        countries = ["Global"]

                    opportunities.append({
                        "title": title,
                        "type": opp_type,
                        "provider": "OpportunityDesk",
                        "description": excerpt,
                        "url": link,
                        "eligibility": {
                            "countries": countries,
                            "stage": ["undergraduate", "graduate"],
                        },
                        "skillTags": [],
                        "deadline": None,
                        "language": "en",
                        "isActive": True,
                        "source": "opportunitydesk",
                        "scrapedAt": datetime.utcnow().isoformat(),
                    })
                except Exception as e:
                    continue

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

    print(f"OpportunityDesk: {len(opportunities)} opportunities found")
    return opportunities


def scrape_opportunities_for_africans():
    opportunities = []
    urls = [
        "https://www.opportunitiesforafricans.com/category/scholarships/",
        "https://www.opportunitiesforafricans.com/category/fellowships/",
        "https://www.opportunitiesforafricans.com/category/grants/",
    ]
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36"}

    for url in urls:
        opp_type = "fellowship"
        if "scholarship" in url:
            opp_type = "grant"
        elif "grant" in url:
            opp_type = "grant"

        try:
            res = requests.get(url, headers=headers, timeout=15)
            soup = BeautifulSoup(res.content, "html.parser")

            items = (
                soup.select("article") or
                soup.select(".post") or
                soup.select(".entry-title")
            )

            for item in items[:15]:
                try:
                    title_el = (
                        item.select_one("h2 a") or
                        item.select_one("h3 a") or
                        item.select_one("a[rel='bookmark']") or
                        item.select_one("a")
                    )

                    if not title_el:
                        continue

                    title = title_el.get_text(strip=True)
                    link = title_el.get("href", url)

                    if not title or len(title) < 10:
                        continue

                    excerpt_el = item.select_one(".entry-summary") or item.select_one("p")
                    excerpt = excerpt_el.get_text(strip=True)[:400] if excerpt_el else ""

                    opportunities.append({
                        "title": title,
                        "type": opp_type,
                        "provider": "Opportunities For Africans",
                        "description": excerpt,
                        "url": link,
                        "eligibility": {
                            "countries": ["Africa"],
                            "stage": ["undergraduate", "graduate"],
                        },
                        "skillTags": [],
                        "deadline": None,
                        "language": "en",
                        "isActive": True,
                        "source": "opportunitiesforafricans",
                        "scrapedAt": datetime.utcnow().isoformat(),
                    })
                except Exception:
                    continue

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

    print(f"OpportunitiesForAfricans: {len(opportunities)} opportunities found")
    return opportunities


def scrape_youthop():
    opportunities = []
    urls = [
        "https://youthop.com/scholarships",
        "https://youthop.com/fellowships",
    ]
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36"}

    for url in urls:
        opp_type = "fellowship" if "fellowship" in url else "grant"

        try:
            res = requests.get(url, headers=headers, timeout=15)
            soup = BeautifulSoup(res.content, "html.parser")

            items = soup.select("article") or soup.select(".opportunity-item") or soup.select(".post")

            for item in items[:15]:
                try:
                    title_el = item.select_one("h2 a") or item.select_one("h3 a") or item.select_one("a")
                    if not title_el:
                        continue

                    title = title_el.get_text(strip=True)
                    link = title_el.get("href", url)

                    if not title or len(title) < 10:
                        continue

                    excerpt_el = item.select_one("p")
                    excerpt = excerpt_el.get_text(strip=True)[:400] if excerpt_el else ""

                    opportunities.append({
                        "title": title,
                        "type": opp_type,
                        "provider": "YouthOp",
                        "description": excerpt,
                        "url": link,
                        "eligibility": {
                            "countries": ["Global"],
                            "stage": ["secondary", "undergraduate", "graduate"],
                        },
                        "skillTags": [],
                        "deadline": None,
                        "language": "en",
                        "isActive": True,
                        "source": "youthop",
                        "scrapedAt": datetime.utcnow().isoformat(),
                    })
                except Exception:
                    continue

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

    print(f"YouthOp: {len(opportunities)} opportunities found")
    return opportunities


if __name__ == "__main__":
    all_opportunities = []
    all_opportunities += scrape_opportunity_desk()
    all_opportunities += scrape_opportunities_for_africans()
    all_opportunities += scrape_youthop()

    with open("scrapers/opportunities_output.json", "w") as f:
        json.dump(all_opportunities, f, indent=2)

    print(f"Total: {len(all_opportunities)} opportunities saved to opportunities_output.json")
