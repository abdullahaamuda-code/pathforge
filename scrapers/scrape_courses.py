import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime


def scrape_freecodecamp():
    # freeCodeCamp certifications — manually curated, always free
    courses = [
        {
            "title": "Responsive Web Design Certification",
            "type": "course",
            "provider": "freeCodeCamp",
            "description": "Learn HTML and CSS to build responsive websites. Completely free, no account needed.",
            "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "applicant", "undergraduate", "graduate"]},
            "skillTags": ["coding", "technology"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "freecodecamp", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "JavaScript Algorithms and Data Structures",
            "type": "course",
            "provider": "freeCodeCamp",
            "description": "Learn JavaScript fundamentals, ES6, data structures and algorithms.",
            "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "applicant", "undergraduate", "graduate"]},
            "skillTags": ["coding", "technology", "python"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "freecodecamp", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Data Analysis with Python",
            "type": "course",
            "provider": "freeCodeCamp",
            "description": "Learn data analysis using Python, NumPy, Pandas and Matplotlib.",
            "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["data_analysis", "python", "technology"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "freecodecamp", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Machine Learning with Python",
            "type": "course",
            "provider": "freeCodeCamp",
            "description": "Build machine learning models using TensorFlow and Python.",
            "url": "https://www.freecodecamp.org/learn/machine-learning-with-python/",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["python", "data_analysis", "technology"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "freecodecamp", "scrapedAt": datetime.utcnow().isoformat(),
        },
    ]
    print(f"freeCodeCamp: {len(courses)} courses added")
    return courses


def get_google_certificates():
    certificates = [
        {
            "title": "Google Data Analytics Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Get job-ready for an entry-level data analytics role in less than 6 months. No degree or experience required.",
            "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["data_analysis", "technology"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google Project Management Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Learn the foundations of project management and get job-ready in under 6 months.",
            "url": "https://www.coursera.org/professional-certificates/google-project-management",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["business", "microsoft_office"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google UX Design Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Build job-ready UX design skills with hands-on portfolio projects.",
            "url": "https://www.coursera.org/professional-certificates/google-ux-design",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["graphic_design", "creative"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google IT Support Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Prepare for a career in IT support in under 6 months.",
            "url": "https://www.coursera.org/professional-certificates/google-it-support",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "applicant", "undergraduate", "graduate"]},
            "skillTags": ["technology", "coding"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Google Digital Marketing Certificate",
            "type": "course",
            "provider": "Google",
            "description": "Learn digital marketing and e-commerce skills to grow businesses online.",
            "url": "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["business", "social_media"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "freeNote": "Apply for financial aid on Coursera",
            "source": "google", "scrapedAt": datetime.utcnow().isoformat(),
        },
    ]
    print(f"Google certificates: {len(certificates)} added")
    return certificates


def get_microsoft_learn():
    courses = [
        {
            "title": "Microsoft Azure Fundamentals (AZ-900)",
            "type": "course",
            "provider": "Microsoft",
            "description": "Learn cloud concepts and Azure services. Free learning path with certification exam available.",
            "url": "https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["technology", "coding"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "microsoft", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Microsoft Power BI Data Analyst",
            "type": "course",
            "provider": "Microsoft",
            "description": "Learn to use Power BI for data analysis and business intelligence.",
            "url": "https://learn.microsoft.com/en-us/training/paths/prepare-data-power-bi/",
            "eligibility": {"countries": ["Global"], "stage": ["undergraduate", "graduate"]},
            "skillTags": ["data_analysis", "microsoft_office", "business"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "microsoft", "scrapedAt": datetime.utcnow().isoformat(),
        },
    ]
    print(f"Microsoft Learn: {len(courses)} courses added")
    return courses


def get_alison_courses():
    courses = [
        {
            "title": "Diploma in Business Management",
            "type": "course",
            "provider": "Alison",
            "description": "Free diploma covering business management fundamentals, strategy, and operations.",
            "url": "https://alison.com/course/diploma-in-business-management",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "undergraduate", "graduate"]},
            "skillTags": ["business"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "alison", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Introduction to Programming Using Python",
            "type": "course",
            "provider": "Alison",
            "description": "Learn Python programming from scratch completely free.",
            "url": "https://alison.com/course/introduction-to-programming-using-python",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "applicant", "undergraduate", "graduate"]},
            "skillTags": ["python", "coding", "technology"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "alison", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Diploma in Health Science",
            "type": "course",
            "provider": "Alison",
            "description": "Free diploma covering health science fundamentals for aspiring healthcare professionals.",
            "url": "https://alison.com/course/diploma-in-health-science",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "undergraduate", "graduate"]},
            "skillTags": ["health"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "alison", "scrapedAt": datetime.utcnow().isoformat(),
        },
        {
            "title": "Introduction to Graphic Design",
            "type": "course",
            "provider": "Alison",
            "description": "Learn the fundamentals of graphic design completely free.",
            "url": "https://alison.com/course/introduction-to-graphic-design-revised",
            "eligibility": {"countries": ["Global"], "stage": ["secondary", "undergraduate", "graduate"]},
            "skillTags": ["graphic_design", "creative"],
            "deadline": None, "language": "en", "isActive": True, "isFree": True,
            "source": "alison", "scrapedAt": datetime.utcnow().isoformat(),
        },
    ]
    print(f"Alison: {len(courses)} courses added")
    return courses


if __name__ == "__main__":
    all_courses = []
    all_courses += scrape_freecodecamp()
    all_courses += get_google_certificates()
    all_courses += get_microsoft_learn()
    all_courses += get_alison_courses()

    with open("scrapers/courses_output.json", "w") as f:
        json.dump(all_courses, f, indent=2)

    print(f"Total: {len(all_courses)} courses saved to courses_output.json")
