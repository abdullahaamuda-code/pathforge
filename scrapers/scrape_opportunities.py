import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

def scrape_opportunity_desk():
    opportunities = []
    urls = [
        "https://opportunitydesk.org/category/fellowships-and-scholarships/",
        "https://opportunitydesk.org/category/fellowships/",
        "https://opportunitydesk.org/category/grants/",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    for url in urls:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.content, "html.parser")
            articles = soup.find_all("article", limit=15)

            for article in articles:
                try:
                    title_el = article.find("h2") or article.find("h3")
                    link_el = article.find("a", href=True)
                    excerpt_el = article.find("p")

                    if not title_el or not link_el:
                        continue

                    title = title_el.get_text(strip=True)
                    link = link_el["href"]
                    excerpt = excerpt_el.get_text(strip=True) if excerpt_el else ""

                    # Determine type from URL
                    opp_type = "fellowship"
                    if "scholarship" in url:
                        opp_type = "grant"
                    elif "grant" in url:
                        opp_type = "grant"

                    # Determine eligibility hints from title
                    countries = []
                    if any(c in title.lower() for c in ["africa", "african"]):
                        countries = ["Africa"]
                    elif "nigeria" in title.lower():
                        countries = ["Nigeria"]
                    elif "global" in title.lower() or "international" in title.lower():
                        countries = ["Global"]

                    opportunities.append({
                        "title": title,
                        "type": opp_type,
                        "provider": "OpportunityDesk",
                        "description": excerpt[:400],
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
                    print(f"Error parsing article: {e}")
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
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    for url in urls:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.content, "html.parser")
            articles = soup.find_all("article", limit=15)

            for article in articles:
                try:
                    title_el = article.find("h2") or article.find("h3")
                    link_el = article.find("a", href=True)
                    excerpt_el = article.find("p")

                    if not title_el or not link_el:
                        continue

                    title = title_el.get_text(strip=True)
                    link = link_el["href"]
                    excerpt = excerpt_el.get_text(strip=True) if excerpt_el else ""

                    opp_type = "fellowship"
                    if "scholarship" in url:
                        opp_type = "grant"

                    opportunities.append({
                        "title": title,
                        "type": opp_type,
                        "provider": "Opportunities For Africans",
                        "description": excerpt[:400],
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
                except Exception as e:
                    print(f"Error parsing article: {e}")
                    continue

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

    print(f"OpportunitiesForAfricans: {len(opportunities)} opportunities found")
    return opportunities


if __name__ == "__main__":
    all_opportunities = []
    all_opportunities += scrape_opportunity_desk()
    all_opportunities += scrape_opportunities_for_africans()

    with open("scrapers/opportunities_output.json", "w") as f:
        json.dump(all_opportunities, f, indent=2)

    print(f"Total: {len(all_opportunities)} opportunities saved to opportunities_output.json")
