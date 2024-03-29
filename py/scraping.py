from bs4 import BeautifulSoup
from selenium import webdriver
from typing import *
import requests
import time
import os
import json
import datetime

import config


championships: Dict[str, str] = {
    "seriea": "https://www.diretta.it/serie-a/",
    "bundesliga": "https://www.diretta.it/calcio/germania/bundesliga/",
    "premierleague": "https://www.diretta.it/calcio/inghilterra/premier-league/",
    "ligue1": "https://www.diretta.it/calcio/francia/ligue-1/",
    "eredivisie": "https://www.diretta.it/calcio/olanda/eredivisie/",
    "laliga": "https://www.diretta.it/calcio/spagna/primera-division/"
}


class Match:
    def __init__(self, match_id, date, time, home_team, away_team, odd1, oddX, odd2):
        self.match_id = match_id
        self.date = date
        self.time = time
        self.home_team = home_team
        self.away_team = away_team
        self.odd1 = odd1
        self.oddX = oddX
        self.odd2 = odd2

    def __str__(self):
        return f"{self.home_team} - {self.away_team} ({self.date} {self.time})"

    def __repr__(self):
        return self.__str__()


def get_soup(url, driver: webdriver.Firefox = None):
    # get the html
    if driver is None:
        browser = get_driver(config.browser)
    else:
        browser = driver
    browser.get(url)
    html = browser.page_source
    # return the soup
    return BeautifulSoup(html, 'html.parser')


def get_matches(soup, target_round: int = None, driver: webdriver.Firefox = None) -> List[Match]:
    # get the matches
    round: int = 0
    matches = []

    page = soup.find("div", class_='sportName')
    for child in page.find_all("div"):
        if child.attrs['class'][0] == 'event__round':
            round = int(child.text.split(" ")[1])
            if target_round is None:
                target_round = round
        elif target_round == round:
            if child.attrs['class'][0] == 'event__match':
                match_id = child.attrs['id'][4:]
                odd1, oddX, odd2 = get_odds(match_id, driver=driver)
                time = child.find("div", class_='event__time').text
                date, time = time.split(" ")
                home_team = child.find(
                    "div", class_='event__participant event__participant--home').text
                away_team = child.find(
                    "div", class_='event__participant event__participant--away').text
                matches.append(
                    Match(match_id, date, time, home_team, away_team, odd1, oddX, odd2))
    # return the matches
    return matches, target_round


def get_odds(match_id: str, driver: webdriver.Firefox = None) -> Tuple[float, float, float]:
    # get the html
    url = f"https://www.diretta.it/partita/{match_id}"
    total1, totalX, total2 = 0, 0, 0
    count1, countX, count2 = 0, 0, 0
    if driver is None:
        browser = get_driver(config.browser)
    else:
        browser = driver
    browser.get(url)
    time.sleep(2)
    html = browser.page_source
    # return the soup
    soup = BeautifulSoup(html, 'html.parser')
    # get the odds
    rows = soup.find_all("div", class_='oddsRowContent')
    for row in rows:
        try:
            odds1 = float(row.find("span", class_='cell o_1').text[1:])
            oddsx = float(row.find("span", class_='cell o_0').text[1:])
            odds2 = float(row.find("span", class_='cell o_2').text[1:])
            total1 += odds1
            totalX += oddsx
            total2 += odds2
            count1 += 1
            countX += 1
            count2 += 1
        except:
            pass
    try:
        return round(total1 / count1, 2), round(totalX / countX, 2), round(total2 / count2, 2)
    except:
        return 0, 0, 0


def matches_to_csv(matches: List[Match], filename: str):
    with open(filename, 'w') as f:
        f.write("id,date,time,home_team,away_team,1,X,2\n")
        for match in matches:
            f.write(
                f"{match.match_id},{match.date},{match.time},{match.home_team},{match.away_team},{match.odd1},{match.oddX},{match.odd2}\n")


def matches_to_json(matches: List[Match], filename: str):
    with open(filename, 'w') as f:
        f.write("{\n")
        for i, match in enumerate(matches):
            f.write(f"\"{match.match_id}\": {{\n")
            f.write(f"\"date\": \"{match.date}\",\n")
            f.write(f"\"time\": \"{match.time}\",\n")
            f.write(f"\"home_team\": \"{match.home_team}\",\n")
            f.write(f"\"away_team\": \"{match.away_team}\",\n")
            f.write(f"\"homeodds\": {match.odd1},\n")
            f.write(f"\"X\": {match.oddX},\n")
            f.write(f"\"awayodds\": {match.odd2}\n")
            if i == len(matches) - 1:
                f.write("}\n")
            else:
                f.write("},\n")
        f.write("}\n")


def get_latest_round(championship: str, driver: webdriver.Firefox = None) -> int:
    soup = get_soup(f"{championships[championship]}calendario/", driver=driver)
    matches, round = get_matches(soup, driver=driver)
    matches_to_json(matches, f"matches/{championship}.json")


def do_scraping():
    #driver = webdriver.Firefox()
    driver = get_driver(config.browser)
    for championship in championships:
        get_latest_round(championship, driver=driver)
    driver.quit()


def getMatchResult(match_id: str, driver: webdriver.Firefox = None) -> str:
    '''
    Returns the result of the match with the given id.
    '''

    # open the results.json file to check if the match results was already scraped
    with open('matches/results.json', 'r') as f:
        results = json.load(f)

    # check if the match result was already scraped
    if match_id in results:
        return results[match_id], driver

    # else, scrape the result and save it in the results.json file

    # get the driver
    if driver is None:
        #driver = webdriver.Firefox()
        driver = get_driver(config.browser)
    url = f"https://www.diretta.it/partita/{match_id}"
    driver.get(url)
    time.sleep(1)
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    result = soup.find("div", class_="detailScore__wrapper").text
    # save the result in the results.json file, but only if the match is finished
    if result != "-":
        results[match_id] = result
        with open('matches/results.json', 'w') as f:
            json.dump(results, f)
    return result, driver


def checkBet(bet_filename: str, driver: webdriver.Firefox = None) -> int:
    '''
    Checks the bet with the given filename.
    Returns -1 if the bet is not finished yet, 0 if the bet is lost, and 1 if the bet is a winning one.
    '''
    # read the bet
    with open(bet_filename, 'r') as f:
        bet = json.load(f)

    # get the matches
    matches = {}
    result = 1
    for match in bet["bets"]:
        match_id = match["match_id"]
        day = match["day"]
        month = match["month"]
        hour = match["time"]
        hour, minute = hour.split(":")
        hour, day, month = int(hour), int(day), int(month)
        # get today's date
        today = datetime.datetime.today()
        if today.month < month or (today.month == month and today.day < day) or (today.month == month and today.day == day and today.hour < hour + 2):
            matches[match_id] = "-"
        else:
            # get the match result (only if it has been played)
            matches[match_id], driver = getMatchResult(match_id, driver=driver)
        if matches[match_id] == "-" and result != 0:  # the match is not finished yet
            result = -1
        elif matches[match_id] != "-":
            home_score, away_score = matches[match_id].split("-")
            home_score, away_score = int(home_score), int(away_score)
            # this match is won
            if home_score > away_score and match["bet"] == "1":
                continue
            # this match is won
            elif home_score == away_score and match["bet"] == "X":
                continue
            # this match is won
            elif home_score < away_score and match["bet"] == "2":
                continue
            else:  # this match is lost
                result = 0
    # all the matches are won
    return result, driver


def getBetsResult(bet_blockchain: List[Tuple[str, str, str]]) -> None:
    '''
    Given a list of bets, checks the result of each bet and saves it in the bet json file.
    The list of bets is given as a list of tuples (hash, address of who made the bet, block number of the block that added the bet).
    '''
    # get the list of the bets on the server
    bet_files = os.listdir(config.BET_FOLDER)
    driver = None
    for hash, _, _ in bet_blockchain:
        # if the bet is on the server, scrape the result (if not already done)
        if hash+".json" in bet_files:
            # get the json of the bet
            with open(config.BET_FOLDER.joinpath(hash+".json"), "r") as f:
                bet_json = json.load(f)
            # get the result of the bet (if exists)
            result = bet_json.get("result")
            # if the result is not already scraped, scrape it
            result_scraped, driver = checkBet(
                config.BET_FOLDER.joinpath(hash+".json"), driver=driver)
            if result is None or (result != result_scraped and result == -1):
                # save the result in the json file
                bet_json["result"] = result_scraped
                with open(config.BET_FOLDER.joinpath(hash+".json"), "w") as f:
                    json.dump(bet_json, f)
    if driver is not None:
        driver.close()


def get_driver(browser: str):
    if browser == "firefox":
        return webdriver.Firefox()
    elif browser == "chrome":
        return webdriver.Chrome()
