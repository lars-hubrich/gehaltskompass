Feature: Post functionality

  Scenario: Create a post
    Given I am on the home page
    When I type and submit a post
    Then I should see the post in the list
