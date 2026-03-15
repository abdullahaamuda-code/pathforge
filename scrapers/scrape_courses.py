import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_class_central():
    courses = []
    urls = [
        "https://www.classcentral.com/subject/cs",
        "https://www.classcentral.com/subject/data-science",
        "https://www.classcentral.com/subject/business-management",
        "https://www.classcentral.com/subject/health",
        "https://www.classcentral.com/subject/social-sciences",
    ]

    interest_map = {
        "cs": "technology",
        "data-science": "technology",
        "business-management": "business",
        "healthcare": "health",
        "social-sciences": "social",
    }

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    for url in urls:
        subject = url.split("/")[-1]
        interest = interest_map.get(subject, "technology")

        try:
            res = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.content, "html.parser")

            course_cards = soup.find_all("li", class_=lambda x: x and "course" in x.lower(), limit=10)

            if not course_cards:
                course_cards = soup.find_all("div", class_=lambda x: x and "course" in x.lower(), limit=10)

            for card in course_cards:
                try:
                    title_el = card.find("h2") or card.find("h3") or card.find("a")
                    if not title_el:
                        continue

                    title = title_el.get_text(strip=True)
                    if not title or len(title) < 5:
                        continue

                    link_el = card.find("a", href=True)
                    link = link_el["href"] if link_el else url
                    if link.startswith("/"):
                        link = "https://www.classcentral.com" + link

                    provider_el = card.find(class_=lambda x: x and "provider" in str(x).lower())
                    provider = provider_el.get_text(strip=True) if provider_el else "Class Central"

                    courses.append({
                        "title": title,
                        "type": "course",
                        "provider": provider,
                        "description": f"Free online course on {title}. Available on Class Central.",
                        "url": link,
                        "eligibility": {
                            "countries": ["Global"],
                            "stage": ["secondary", "applicant", "undergraduate", "graduate"],
                        },
                        "skillTags": [interest],
                        "deadline": None,
                        "language": "en",
                        "isActive": True,
                        "isFree": True,
                        "source": "classcentral",
                        "scrapedAt": datetime.utcnow().isoformat(),
                    })
                except Exception as e:
                    print(f"Error parsing course card: {e}")
                    continue

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

    print(f"Class Central: {len(courses)} courses found")
    return courses


def get_google_certificates():
    # Google certificates — manually curated since they don't change often
    certificates = [
        {
            "title": "Google Data Analytics Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Get job-ready for an entry-level data analytics role in less than 6 months. No degree or experience required.",
            "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["data_analysis", "technology"],
            "deadline": None,
            "language": "en",
            "isActive": True,
            "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google",
            "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google Project Management Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Learn the foundations of project management and get job-ready in under 6 months.",
            "url": "https://www.coursera.org/professional-certificates/google-project-management",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["business", "microsoft_office"],
            "deadline": None,
            "language": "en",
            "isActive": True,
            "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google",
            "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google UX Design Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Build job-ready UX design skills with hands-on portfolio projects.",
            "url": "https://www.coursera.org/professional-certificates/google-ux-design",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["graphic_design", "creative"],
            "deadline": None,
            "language": "en",
            "isActive": True,
            "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google",
            "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google IT Support Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Prepare for a career in IT support in under 6 months.",
            "url": "https://www.coursera.org/professional-certificates/google-it-support",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "applicant", "undergraduate", "graduate"]},
            "skillTags": ["technology", "coding"],
            "deadline": None,
            "language": "en",
            "isActive": True,
            "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google",
            "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google Digital Marketing Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Learn digital marketing and e-commerce skills to grow businesses online.",
            "url": "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["business", "social_media"],
            "deadline": None,
            "language": "en",
            "isActive": True,
            "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google",
            "scrapedAt": datetime.utcnow().isoformat(),
        },
    ]
    print(f"Google certificates: {len(certificates)} added")
    return certificates


if __name__ == "__main__":
    all_courses = []
    all_courses += scrape_class_central()
    all_courses += get_google_certificates()

    with open("scrapers/courses_output.json", "w") as f:
        json.dump(all_courses, f, indent=2)

    print(f"Total: {len(all_courses)} courses saved to courses_output.json")
