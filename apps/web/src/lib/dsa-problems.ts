/**
 * Generated file: do not edit by hand.
 *
 * 333 practice problems for the mock problem list. Slugs that already exist
 * in the hand-written PROBLEMS set are skipped, so /problems/[slug] never has
 * two entries for one route. acceptanceRate and totalSubmissions are
 * synthesized deterministically (seeded by slug), since these problems have
 * no real judge stats.
 */
import type { Problem } from "./types";

export const DSA_PROBLEMS: Problem[] = [
  {
    "id": 1000,
    "slug": "contains-duplicate",
    "title": "Contains Duplicate",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 68.5,
    "totalSubmissions": 100900,
    "description": [
      "Given an integer array `nums`, return `true` if any value appears at least twice, and `false` if every element is distinct."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "true"
      },
      {
        "input": "nums = [1,2,3,4]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction containsDuplicate(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction containsDuplicate(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef contains_duplicate(nums):\n    pass\n"
    }
  },
  {
    "id": 1001,
    "slug": "valid-anagram",
    "title": "Valid Anagram",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 69.3,
    "totalSubmissions": 84200,
    "description": [
      "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s` (same characters, same counts), otherwise `false`."
    ],
    "examples": [
      {
        "input": "s = \"anagram\", t = \"nagaram\"",
        "output": "true"
      },
      {
        "input": "s = \"rat\", t = \"car\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 5 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isAnagram(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isAnagram(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_anagram(s, t):\n    pass\n"
    }
  },
  {
    "id": 1002,
    "slug": "majority-element",
    "title": "Majority Element",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 47.9,
    "totalSubmissions": 89800,
    "description": [
      "Given an array `nums` of size n, return the majority element — the one that appears more than ⌊n/2⌋ times. You may assume it always exists."
    ],
    "examples": [
      {
        "input": "nums = [3,2,3]",
        "output": "3"
      },
      {
        "input": "nums = [2,2,1,1,1,2,2]",
        "output": "2"
      }
    ],
    "constraints": [
      "n == nums.length",
      "1 <= n <= 5 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction majorityElement(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction majorityElement(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef majority_element(nums):\n    pass\n"
    }
  },
  {
    "id": 1003,
    "slug": "group-anagrams",
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 41.3,
    "totalSubmissions": 179200,
    "description": [
      "Given an array of strings `strs`, group the anagrams together. Return the groups in any order; the words within a group may be in any order."
    ],
    "examples": [
      {
        "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"
      },
      {
        "input": "strs = [\"\"]",
        "output": "[[\"\"]]"
      }
    ],
    "constraints": [
      "1 <= strs.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction groupAnagrams(strs) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction groupAnagrams(strs): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef group_anagrams(strs):\n    pass\n"
    }
  },
  {
    "id": 1004,
    "slug": "top-k-frequent",
    "title": "Top K Frequent Elements",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 36.3,
    "totalSubmissions": 157200,
    "description": [
      "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements, in any order."
    ],
    "examples": [
      {
        "input": "nums = [1,1,1,2,2,3], k = 2",
        "output": "[1,2]"
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "k is in the range [1, number of unique elements]"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction topKFrequent(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction topKFrequent(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef top_k_frequent(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1005,
    "slug": "product-except-self",
    "title": "Product of Array Except Self",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 52.8,
    "totalSubmissions": 103200,
    "description": [
      "Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of all elements except `nums[i]`.",
      "Solve it without using division and in O(n) time."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "[24,12,8,6]"
      },
      {
        "input": "nums = [-1,1,0,-3,3]",
        "output": "[0,0,9,0,0]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction productExceptSelf(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction productExceptSelf(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef product_except_self(nums):\n    pass\n"
    }
  },
  {
    "id": 1006,
    "slug": "subarray-sum-equals-k",
    "title": "Subarray Sum Equals K",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 47.7,
    "totalSubmissions": 220700,
    "description": [
      "Given an integer array `nums` and an integer `k`, return the total number of contiguous subarrays whose sum equals `k`."
    ],
    "examples": [
      {
        "input": "nums = [1,1,1], k = 2",
        "output": "2"
      },
      {
        "input": "nums = [1,2,3], k = 3",
        "output": "2"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-1000 <= nums[i] <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subarraySum(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subarraySum(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef subarray_sum(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1007,
    "slug": "longest-consecutive-sequence",
    "title": "Longest Consecutive Sequence",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 57,
    "totalSubmissions": 232500,
    "description": [
      "Given an unsorted array `nums`, return the length of the longest run of consecutive integers. Solve it in O(n) time."
    ],
    "examples": [
      {
        "input": "nums = [100,4,200,1,3,2]",
        "output": "4",
        "explanation": "The run [1,2,3,4]."
      },
      {
        "input": "nums = [0,3,7,2,5,8,4,6,0,1]",
        "output": "9"
      }
    ],
    "constraints": [
      "0 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestConsecutive(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestConsecutive(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_consecutive(nums):\n    pass\n"
    }
  },
  {
    "id": 1008,
    "slug": "ransom-note",
    "title": "Ransom Note",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 67.5,
    "totalSubmissions": 272400,
    "description": [
      "Return `true` if `ransomNote` can be constructed from the letters of `magazine`, each magazine letter used at most once."
    ],
    "examples": [
      {
        "input": "ransomNote = \"a\", magazine = \"b\"",
        "output": "false"
      },
      {
        "input": "ransomNote = \"aa\", magazine = \"ab\"",
        "output": "false"
      },
      {
        "input": "ransomNote = \"aa\", magazine = \"aab\"",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= lengths <= 10^5",
      "Lowercase letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canConstruct(ransomNote, magazine) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canConstruct(ransomNote, magazine): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_construct(ransomNote, magazine):\n    pass\n"
    }
  },
  {
    "id": 1009,
    "slug": "unique-characters",
    "title": "String Has All Unique Characters",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 53.9,
    "totalSubmissions": 113500,
    "description": [
      "Given a string `s`, return `true` if every character in it is unique (no character appears twice), and `false` otherwise. Comparison is case-sensitive.",
      "From *interactive-coding-challenges* (Arrays & Strings)."
    ],
    "examples": [
      {
        "input": "s = \"abcdef\"",
        "output": "true"
      },
      {
        "input": "s = \"hello\"",
        "output": "false",
        "explanation": "'l' repeats."
      }
    ],
    "constraints": [
      "0 <= s.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hasAllUnique(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hasAllUnique(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef has_all_unique(s):\n    pass\n"
    }
  },
  {
    "id": 1010,
    "slug": "first-unique-character",
    "title": "First Unique Character",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 67.3,
    "totalSubmissions": 295800,
    "description": [
      "Given a string `s`, return the index of the **first** character that appears exactly once. If there is no such character, return `-1`.",
      "From *interactive-coding-challenges* (Arrays & Strings)."
    ],
    "examples": [
      {
        "input": "s = \"leetcode\"",
        "output": "0"
      },
      {
        "input": "s = \"loveleetcode\"",
        "output": "2"
      },
      {
        "input": "s = \"aabb\"",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "s contains only lowercase letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction firstUniqChar(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction firstUniqChar(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef first_uniq_char(s):\n    pass\n"
    }
  },
  {
    "id": 1011,
    "slug": "maximum-product-of-three-numbers",
    "title": "Maximum Product of Three Numbers",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 47.1,
    "totalSubmissions": 145500,
    "description": [
      "Given an integer array `nums`, find three numbers whose product is the maximum and return that maximum product.",
      "From *interactive-coding-challenges* (Online Judges: highest product of three)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "6"
      },
      {
        "input": "nums = [1,2,3,4]",
        "output": "24"
      },
      {
        "input": "nums = [-4,-3,-2,-1,60]",
        "output": "720",
        "explanation": "(-4)·(-3)·60 — two negatives make a positive."
      }
    ],
    "constraints": [
      "3 <= nums.length <= 10^4",
      "-1000 <= nums[i] <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximumProduct(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximumProduct(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef maximum_product(nums):\n    pass\n"
    }
  },
  {
    "id": 1012,
    "slug": "isomorphic-strings",
    "title": "Isomorphic Strings",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 69.3,
    "totalSubmissions": 188800,
    "description": [
      "Two strings are **isomorphic** if the characters of `s` can be replaced to get `t`, with a consistent one-to-one mapping (each character maps to exactly one other, and no two characters map to the same one). Return `true` if `s` and `t` are isomorphic.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "s = \"egg\", t = \"add\"",
        "output": "true",
        "explanation": "e→a, g→d."
      },
      {
        "input": "s = \"foo\", t = \"bar\"",
        "output": "false",
        "explanation": "o would have to map to both a and r."
      }
    ],
    "constraints": [
      "1 <= s.length <= 5·10^4",
      "s.length === t.length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isIsomorphic(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isIsomorphic(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_isomorphic(s, t):\n    pass\n"
    }
  },
  {
    "id": 1013,
    "slug": "contains-duplicate-ii",
    "title": "Contains Duplicate II",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 70.9,
    "totalSubmissions": 274600,
    "description": [
      "Given an array `nums` and integer `k`, return `true` if there are two **distinct indices** `i` and `j` with `nums[i] === nums[j]` and `|i - j| <= k`.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1], k = 3",
        "output": "true"
      },
      {
        "input": "nums = [1,2,3,1,2,3], k = 2",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "0 <= k <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction containsNearbyDuplicate(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction containsNearbyDuplicate(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef contains_nearby_duplicate(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1014,
    "slug": "majority-element-ii",
    "title": "Majority Element II",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 38.6,
    "totalSubmissions": 94600,
    "description": [
      "Given an integer array `nums`, return all elements that appear **more than ⌊n/3⌋ times**, in ascending order. (There can be at most two such elements.)",
      "From AlgoMaster **AM-600** (Arrays)."
    ],
    "examples": [
      {
        "input": "nums = [3,2,3]",
        "output": "[3]"
      },
      {
        "input": "nums = [1,1,1,3,3,2,2,2]",
        "output": "[1,2]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5·10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction majorityElement(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction majorityElement(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef majority_element(nums):\n    pass\n"
    }
  },
  {
    "id": 1015,
    "slug": "third-maximum-number",
    "title": "Third Maximum Number",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 57.3,
    "totalSubmissions": 149300,
    "description": [
      "Given an integer array `nums`, return the **third distinct maximum**. If it doesn't exist (fewer than 3 distinct values), return the maximum.",
      "From AlgoMaster **AM-600** (Arrays)."
    ],
    "examples": [
      {
        "input": "nums = [3,2,1]",
        "output": "1"
      },
      {
        "input": "nums = [1,2]",
        "output": "2",
        "explanation": "Only 2 distinct values → return the max."
      },
      {
        "input": "nums = [2,2,3,1]",
        "output": "1",
        "explanation": "Distinct: 3, 2, 1 → third is 1."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction thirdMax(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction thirdMax(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef third_max(nums):\n    pass\n"
    }
  },
  {
    "id": 1016,
    "slug": "word-pattern",
    "title": "Word Pattern",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 74.2,
    "totalSubmissions": 227800,
    "description": [
      "Given a `pattern` (letters) and a string `s` of space-separated words, return `true` if the words follow the same pattern — a **one-to-one** correspondence between each letter and each word.",
      "From AlgoMaster **AM-600** (Hashing). The word-level cousin of Isomorphic Strings."
    ],
    "examples": [
      {
        "input": "pattern = \"abba\", s = \"dog cat cat dog\"",
        "output": "true"
      },
      {
        "input": "pattern = \"abba\", s = \"dog cat cat fish\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= pattern.length <= 300",
      "s has words separated by single spaces"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wordPattern(pattern, s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wordPattern(pattern, s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef word_pattern(pattern, s):\n    pass\n"
    }
  },
  {
    "id": 1017,
    "slug": "find-all-numbers-disappeared",
    "title": "Find All Numbers Disappeared in an Array",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 59.7,
    "totalSubmissions": 128900,
    "description": [
      "Given an array `nums` of `n` integers where each value is in the range `1..n`, return all integers in `1..n` that do **not** appear, in ascending order.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "nums = [4,3,2,7,8,2,3,1]",
        "output": "[5,6]"
      },
      {
        "input": "nums = [1,1]",
        "output": "[2]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= n"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findDisappearedNumbers(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findDisappearedNumbers(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_disappeared_numbers(nums):\n    pass\n"
    }
  },
  {
    "id": 1018,
    "slug": "intersection-of-two-arrays-ii",
    "title": "Intersection of Two Arrays II",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 60.6,
    "totalSubmissions": 163700,
    "description": [
      "Given two arrays `nums1` and `nums2`, return their intersection **including duplicates** — each element appears as many times as it shows in both. Return it in ascending order.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "nums1 = [1,2,2,1], nums2 = [2,2]",
        "output": "[2,2]"
      },
      {
        "input": "nums1 = [4,9,5], nums2 = [9,4,9,8,4]",
        "output": "[4,9]"
      }
    ],
    "constraints": [
      "1 <= nums1.length, nums2.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction intersect(nums1, nums2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction intersect(nums1, nums2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef intersect(nums1, nums2):\n    pass\n"
    }
  },
  {
    "id": 1019,
    "slug": "longest-palindrome-buildable",
    "title": "Longest Palindrome (buildable from letters)",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 59.7,
    "totalSubmissions": 234200,
    "description": [
      "Given a string `s` of letters (case-sensitive), return the **length** of the longest palindrome that can be built using those letters (you don't have to use all of them).",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "s = \"abccccdd\"",
        "output": "7",
        "explanation": "\"dccaccd\" (length 7)."
      },
      {
        "input": "s = \"a\"",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= s.length <= 2000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestPalindrome(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestPalindrome(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_palindrome(s):\n    pass\n"
    }
  },
  {
    "id": 1020,
    "slug": "first-missing-positive",
    "title": "First Missing Positive",
    "difficulty": "Hard",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 31,
    "totalSubmissions": 20500,
    "description": [
      "Given an unsorted integer array `nums`, return the **smallest positive integer** that is not present. Aim for O(n) time and O(1) extra space.",
      "From AlgoMaster **AM-600** (Arrays)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,0]",
        "output": "3"
      },
      {
        "input": "nums = [3,4,-1,1]",
        "output": "2"
      },
      {
        "input": "nums = [7,8,9,11,12]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction firstMissingPositive(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction firstMissingPositive(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef first_missing_positive(nums):\n    pass\n"
    }
  },
  {
    "id": 1021,
    "slug": "number-of-good-pairs",
    "title": "Number of Good Pairs",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 52.3,
    "totalSubmissions": 273000,
    "description": [
      "Given an array `nums`, return the number of **good pairs** — pairs of indices `(i, j)` with `i < j` and `nums[i] === nums[j]`.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1,1,3]",
        "output": "4",
        "explanation": "3 pairs of 1s + 1 pair of 3s."
      },
      {
        "input": "nums = [1,1,1,1]",
        "output": "6"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numIdenticalPairs(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numIdenticalPairs(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_identical_pairs(nums):\n    pass\n"
    }
  },
  {
    "id": 1022,
    "slug": "maximum-number-of-balloons",
    "title": "Maximum Number of Balloons",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 54.4,
    "totalSubmissions": 244000,
    "description": [
      "Given a string `text`, return the maximum number of times the word `\"balloon\"` can be formed using its letters (each letter used once per instance).",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "text = \"nlaebolko\"",
        "output": "1"
      },
      {
        "input": "text = \"loonbalxballpoon\"",
        "output": "2"
      },
      {
        "input": "text = \"leetcode\"",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= text.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxNumberOfBalloons(text) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxNumberOfBalloons(text): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_number_of_balloons(text):\n    pass\n"
    }
  },
  {
    "id": 1023,
    "slug": "number-of-matching-subsequences",
    "title": "Number of Matching Subsequences",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 62.1,
    "totalSubmissions": 258700,
    "description": [
      "Given a string `s` and an array of `words`, return how many of the words are **subsequences** of `s` (obtainable by deleting some characters of `s` without reordering).",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "s = \"abcde\", words = [\"a\",\"bb\",\"acd\",\"ace\"]",
        "output": "3",
        "explanation": "\"a\", \"acd\", \"ace\" are subsequences."
      }
    ],
    "constraints": [
      "1 <= s.length <= 5·10^4",
      "1 <= words.length <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numMatchingSubseq(s, words) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numMatchingSubseq(s, words): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_matching_subseq(s, words):\n    pass\n"
    }
  },
  {
    "id": 1024,
    "slug": "min-deletions-frequencies-unique",
    "title": "Minimum Deletions to Make Character Frequencies Unique",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 46.1,
    "totalSubmissions": 266000,
    "description": [
      "A string is 'good' if no two distinct characters have the same frequency. Given `s`, return the **minimum number of character deletions** needed to make it good.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "s = \"aab\"",
        "output": "0",
        "explanation": "Frequencies 2 and 1 are already unique."
      },
      {
        "input": "s = \"aaabbbcc\"",
        "output": "2",
        "explanation": "a:3, b:3, c:2 → delete to 3,2,1."
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minDeletions(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minDeletions(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_deletions(s):\n    pass\n"
    }
  },
  {
    "id": 1025,
    "slug": "determine-if-two-strings-are-close",
    "title": "Determine if Two Strings Are Close",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 34.6,
    "totalSubmissions": 64400,
    "description": [
      "Two strings are **close** if you can turn one into the other using any number of: (1) swapping two existing characters, or (2) transforming every occurrence of one existing character into another (and vice-versa). Return `true` if `word1` and `word2` are close.",
      "From AlgoMaster **AM-600** (Hashing)."
    ],
    "examples": [
      {
        "input": "word1 = \"abc\", word2 = \"bca\"",
        "output": "true"
      },
      {
        "input": "word1 = \"a\", word2 = \"aa\"",
        "output": "false"
      },
      {
        "input": "word1 = \"cabbba\", word2 = \"abbccc\"",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= word1.length, word2.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction closeStrings(word1, word2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction closeStrings(word1, word2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef close_strings(word1, word2):\n    pass\n"
    }
  },
  {
    "id": 1026,
    "slug": "number-of-zero-filled-subarrays",
    "title": "Number of Zero-Filled Subarrays",
    "difficulty": "Medium",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 50.7,
    "totalSubmissions": 72400,
    "description": [
      "Given an integer array `nums`, return the number of subarrays (contiguous) filled entirely with `0`.",
      "From AlgoMaster **AM-600** (Arrays)."
    ],
    "examples": [
      {
        "input": "nums = [1,3,0,0,2,0,0,4]",
        "output": "6",
        "explanation": "Two runs of two zeros → 3 + 3."
      },
      {
        "input": "nums = [0,0,0,2,0,0]",
        "output": "9"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction zeroFilledSubarray(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction zeroFilledSubarray(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef zero_filled_subarray(nums):\n    pass\n"
    }
  },
  {
    "id": 1027,
    "slug": "find-pivot-index",
    "title": "Find Pivot Index",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 75.3,
    "totalSubmissions": 146300,
    "description": [
      "Given an array `nums`, return the **leftmost pivot index**: the index where the sum of all numbers strictly to its left equals the sum of all numbers strictly to its right. Return `-1` if none exists.",
      "Canonical must-do (AM-600 Arrays / Prefix Sum family)."
    ],
    "examples": [
      {
        "input": "nums = [1,7,3,6,5,6]",
        "output": "3",
        "explanation": "left 1+7+3 = 11, right 5+6 = 11."
      },
      {
        "input": "nums = [1,2,3]",
        "output": "-1"
      },
      {
        "input": "nums = [2,1,-1]",
        "output": "0",
        "explanation": "left is empty (0), right is 1 + (-1) = 0."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-1000 <= nums[i] <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pivotIndex(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pivotIndex(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef pivot_index(nums):\n    pass\n"
    }
  },
  {
    "id": 1028,
    "slug": "degree-of-an-array",
    "title": "Degree of an Array",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 73.2,
    "totalSubmissions": 170700,
    "description": [
      "The **degree** of an array is the maximum frequency of any one element. Given `nums`, return the length of the **shortest contiguous subarray** that has the same degree as `nums`.",
      "Canonical must-do (AM-600 Hashing family)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,2,3,1]",
        "output": "2",
        "explanation": "Degree 2; [2,2] is the shortest subarray with degree 2."
      },
      {
        "input": "nums = [1,2,2,3,1,4,2]",
        "output": "6"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5·10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findShortestSubArray(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findShortestSubArray(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_shortest_sub_array(nums):\n    pass\n"
    }
  },
  {
    "id": 1029,
    "slug": "find-the-difference",
    "title": "Find the Difference",
    "difficulty": "Easy",
    "tags": [
      "Arrays & Hashing"
    ],
    "acceptanceRate": 72.9,
    "totalSubmissions": 268700,
    "description": [
      "String `t` is string `s` with its characters shuffled and **one extra letter** inserted. Return that extra letter.",
      "Canonical must-do (AM-600 Hashing / Bit family)."
    ],
    "examples": [
      {
        "input": "s = \"abcd\", t = \"abcde\"",
        "output": "\"e\""
      },
      {
        "input": "s = \"\", t = \"y\"",
        "output": "\"y\""
      }
    ],
    "constraints": [
      "0 <= s.length <= 1000",
      "t.length === s.length + 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findTheDifference(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findTheDifference(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_the_difference(s, t):\n    pass\n"
    }
  },
  {
    "id": 1030,
    "slug": "valid-palindrome",
    "title": "Valid Palindrome",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 57.2,
    "totalSubmissions": 63300,
    "description": [
      "Given a string `s`, return `true` if it reads the same forward and backward after lowercasing and removing all non-alphanumeric characters."
    ],
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true"
      },
      {
        "input": "s = \"race a car\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 2 * 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPalindrome(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPalindrome(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_palindrome(s):\n    pass\n"
    }
  },
  {
    "id": 1031,
    "slug": "two-sum-ii",
    "title": "Two Sum II — Sorted Input",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 52,
    "totalSubmissions": 195400,
    "description": [
      "Given a 1-indexed array `numbers` sorted in non-decreasing order, return the 1-based indices of the two numbers that add up to `target`.",
      "There is exactly one solution, and you may not use the same element twice. Use O(1) extra space."
    ],
    "examples": [
      {
        "input": "numbers = [2,7,11,15], target = 9",
        "output": "[1,2]"
      },
      {
        "input": "numbers = [2,3,4], target = 6",
        "output": "[1,3]"
      }
    ],
    "constraints": [
      "2 <= numbers.length <= 3 * 10^4",
      "numbers is sorted in non-decreasing order"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction twoSumSorted(numbers, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction twoSumSorted(numbers, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef two_sum_sorted(numbers, target):\n    pass\n"
    }
  },
  {
    "id": 1032,
    "slug": "three-sum",
    "title": "3Sum",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 41.9,
    "totalSubmissions": 184700,
    "description": [
      "Given an integer array `nums`, return all unique triplets `[a, b, c]` with a + b + c = 0.",
      "The result must not contain duplicate triplets. Return them in any order."
    ],
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1,-1,2],[-1,0,1]]"
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]"
      }
    ],
    "constraints": [
      "3 <= nums.length <= 3000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction threeSum(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction threeSum(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef three_sum(nums):\n    pass\n"
    }
  },
  {
    "id": 1033,
    "slug": "container-with-most-water",
    "title": "Container With Most Water",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 47.9,
    "totalSubmissions": 64100,
    "description": [
      "Given heights `height[i]`, pick two lines that together with the x-axis form a container holding the most water. Return that maximum area.",
      "Area = min(height[l], height[r]) × (r − l)."
    ],
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49"
      },
      {
        "input": "height = [1,1]",
        "output": "1"
      }
    ],
    "constraints": [
      "2 <= height.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxArea(height) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxArea(height): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_area(height):\n    pass\n"
    }
  },
  {
    "id": 1034,
    "slug": "move-zeroes",
    "title": "Move Zeroes",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 69.2,
    "totalSubmissions": 86100,
    "description": [
      "Given an integer array `nums`, move all 0s to the end while keeping the relative order of the non-zero elements. Return the modified array (modify in place)."
    ],
    "examples": [
      {
        "input": "nums = [0,1,0,3,12]",
        "output": "[1,3,12,0,0]"
      },
      {
        "input": "nums = [0]",
        "output": "[0]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction moveZeroes(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction moveZeroes(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef move_zeroes(nums):\n    pass\n"
    }
  },
  {
    "id": 1035,
    "slug": "is-subsequence",
    "title": "Is Subsequence",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 57.1,
    "totalSubmissions": 139900,
    "description": [
      "Return `true` if `s` is a subsequence of `t`: all of s's characters appear in t in the same relative order (deleting some t-characters, keeping order)."
    ],
    "examples": [
      {
        "input": "s = \"abc\", t = \"ahbgdc\"",
        "output": "true"
      },
      {
        "input": "s = \"axc\", t = \"ahbgdc\"",
        "output": "false"
      }
    ],
    "constraints": [
      "0 <= s.length <= 100",
      "0 <= t.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSubsequence(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSubsequence(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_subsequence(s, t):\n    pass\n"
    }
  },
  {
    "id": 1036,
    "slug": "merge-sorted-array",
    "title": "Merge Sorted Array",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 75.3,
    "totalSubmissions": 187000,
    "description": [
      "`nums1` has length m + n: its first `m` entries are sorted values, the rest are 0-placeholders. `nums2` has `n` sorted values. Merge `nums2` into `nums1` so it contains all m + n values in order, and return `nums1`."
    ],
    "examples": [
      {
        "input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        "output": "[1,2,2,3,5,6]"
      },
      {
        "input": "nums1 = [0], m = 0, nums2 = [1], n = 1",
        "output": "[1]"
      }
    ],
    "constraints": [
      "0 <= m, n <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mergeSortedArrays(nums1, m, nums2, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mergeSortedArrays(nums1, m, nums2, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef merge_sorted_arrays(nums1, m, nums2, n):\n    pass\n"
    }
  },
  {
    "id": 1037,
    "slug": "sort-colors",
    "title": "Sort Colors",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 47.9,
    "totalSubmissions": 266400,
    "description": [
      "Sort an array containing only 0, 1, and 2 in place, in a single pass without the library sort, and return it."
    ],
    "examples": [
      {
        "input": "nums = [2,0,2,1,1,0]",
        "output": "[0,0,1,1,2,2]"
      },
      {
        "input": "nums = [2,0,1]",
        "output": "[0,1,2]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 300",
      "nums[i] is 0, 1, or 2"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortColors(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortColors(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sort_colors(nums):\n    pass\n"
    }
  },
  {
    "id": 1038,
    "slug": "three-sum-closest",
    "title": "3Sum Closest",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 37.2,
    "totalSubmissions": 210600,
    "description": [
      "Return the sum of the three integers in `nums` whose sum is closest to `target` (each input has exactly one such answer)."
    ],
    "examples": [
      {
        "input": "nums = [-1,2,1,-4], target = 1",
        "output": "2",
        "explanation": "-1 + 2 + 1 = 2."
      },
      {
        "input": "nums = [0,0,0], target = 1",
        "output": "0"
      }
    ],
    "constraints": [
      "3 <= nums.length <= 500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction threeSumClosest(nums, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction threeSumClosest(nums, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef three_sum_closest(nums, target):\n    pass\n"
    }
  },
  {
    "id": 1039,
    "slug": "string-compression",
    "title": "String Compression (run-length)",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 58.1,
    "totalSubmissions": 233300,
    "description": [
      "Compress `s` by replacing each run of the same character with the character followed by the run length (e.g. `\"aaa\"` → `\"a3\"`). Return the compressed string **only if it is shorter** than the original; otherwise return the original string unchanged.",
      "From *interactive-coding-challenges* (Arrays & Strings: compress a string)."
    ],
    "examples": [
      {
        "input": "s = \"aabcccccaaa\"",
        "output": "\"a2b1c5a3\""
      },
      {
        "input": "s = \"abcdef\"",
        "output": "\"abcdef\"",
        "explanation": "\"a1b1c1d1e1f1\" is longer, so keep the original."
      }
    ],
    "constraints": [
      "0 <= s.length <= 10^4",
      "s contains only letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction compressString(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction compressString(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef compress_string(s):\n    pass\n"
    }
  },
  {
    "id": 1040,
    "slug": "string-rotation",
    "title": "String Rotation",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 63.4,
    "totalSubmissions": 284200,
    "description": [
      "Given two strings `s1` and `s2`, return `true` if `s2` is a **rotation** of `s1` — that is, `s1` split at some point and the two pieces swapped (e.g. `\"waterbottle\"` → `\"erbottlewat\"`).",
      "From *interactive-coding-challenges* (Arrays & Strings: is a string a rotation of another)."
    ],
    "examples": [
      {
        "input": "s1 = \"waterbottle\", s2 = \"erbottlewat\"",
        "output": "true"
      },
      {
        "input": "s1 = \"hello\", s2 = \"llohe\"",
        "output": "true"
      },
      {
        "input": "s1 = \"hello\", s2 = \"helol\"",
        "output": "false"
      }
    ],
    "constraints": [
      "0 <= s1.length, s2.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isRotation(s1, s2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isRotation(s1, s2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_rotation(s1, s2):\n    pass\n"
    }
  },
  {
    "id": 1041,
    "slug": "squares-of-a-sorted-array",
    "title": "Squares of a Sorted Array",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 71.1,
    "totalSubmissions": 229400,
    "description": [
      "Given an array `nums` sorted in non-decreasing order, return an array of the squares of each number, also sorted non-decreasing.",
      "From AlgoMaster **AM-600** (Two Pointers)."
    ],
    "examples": [
      {
        "input": "nums = [-4,-1,0,3,10]",
        "output": "[0,1,9,16,100]"
      },
      {
        "input": "nums = [-7,-3,2,3,11]",
        "output": "[4,9,9,49,121]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "nums is sorted non-decreasing"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortedSquares(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortedSquares(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sorted_squares(nums):\n    pass\n"
    }
  },
  {
    "id": 1042,
    "slug": "backspace-string-compare",
    "title": "Backspace String Compare",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 74.4,
    "totalSubmissions": 141300,
    "description": [
      "Given two strings `s` and `t`, return `true` if they are equal after typing them into empty text editors, where `#` means a backspace (delete the previous character). A backspace on empty text does nothing.",
      "From AlgoMaster **AM-600** (Two Pointers)."
    ],
    "examples": [
      {
        "input": "s = \"ab#c\", t = \"ad#c\"",
        "output": "true",
        "explanation": "Both become \"ac\"."
      },
      {
        "input": "s = \"a#c\", t = \"b\"",
        "output": "false",
        "explanation": "\"c\" vs \"b\"."
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction backspaceCompare(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction backspaceCompare(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef backspace_compare(s, t):\n    pass\n"
    }
  },
  {
    "id": 1043,
    "slug": "4sum",
    "title": "4Sum",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 36.4,
    "totalSubmissions": 133600,
    "description": [
      "Given an array `nums` and a `target`, return all **unique** quadruplets `[a, b, c, d]` (four distinct indices) such that `a + b + c + d === target`. The result must not contain duplicate quadruplets; any order is accepted.",
      "From AlgoMaster **AM-600** (Two Pointers). The 4-element generalization of 3Sum."
    ],
    "examples": [
      {
        "input": "nums = [1,0,-1,0,-2,2], target = 0",
        "output": "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]"
      },
      {
        "input": "nums = [2,2,2,2,2], target = 8",
        "output": "[[2,2,2,2]]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 200",
      "-10^9 <= nums[i], target <= 10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction fourSum(nums, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction fourSum(nums, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef four_sum(nums, target):\n    pass\n"
    }
  },
  {
    "id": 1044,
    "slug": "valid-palindrome-ii",
    "title": "Valid Palindrome II",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 49.1,
    "totalSubmissions": 253300,
    "description": [
      "Given a string `s`, return `true` if it can be a palindrome after deleting **at most one** character.",
      "From AlgoMaster **AM-600** (Two Pointers / Strings)."
    ],
    "examples": [
      {
        "input": "s = \"aba\"",
        "output": "true"
      },
      {
        "input": "s = \"abca\"",
        "output": "true",
        "explanation": "Delete 'c' (or 'b')."
      },
      {
        "input": "s = \"abc\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "s is lowercase letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validPalindrome(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validPalindrome(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef valid_palindrome(s):\n    pass\n"
    }
  },
  {
    "id": 1045,
    "slug": "next-permutation",
    "title": "Next Permutation",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 51.3,
    "totalSubmissions": 254200,
    "description": [
      "Rearrange `nums` into the **next lexicographically greater** permutation of its numbers, in place, and return it. If no greater permutation exists (the array is descending), return the smallest permutation (ascending).",
      "From AlgoMaster **AM-600** (Arrays)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "[1,3,2]"
      },
      {
        "input": "nums = [3,2,1]",
        "output": "[1,2,3]",
        "explanation": "Already the largest → wrap to smallest."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextPermutation(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextPermutation(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef next_permutation(nums):\n    pass\n"
    }
  },
  {
    "id": 1046,
    "slug": "merge-strings-alternately",
    "title": "Merge Strings Alternately",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 53.7,
    "totalSubmissions": 239300,
    "description": [
      "Merge `word1` and `word2` by adding letters in alternating order, starting with `word1`. If one string is longer, append its remaining letters at the end.",
      "From AlgoMaster **AM-600** (Two Pointers)."
    ],
    "examples": [
      {
        "input": "word1 = \"abc\", word2 = \"pqr\"",
        "output": "\"apbqcr\""
      },
      {
        "input": "word1 = \"ab\", word2 = \"pqrs\"",
        "output": "\"apbqrs\""
      }
    ],
    "constraints": [
      "1 <= word1.length, word2.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mergeAlternately(word1, word2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mergeAlternately(word1, word2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef merge_alternately(word1, word2):\n    pass\n"
    }
  },
  {
    "id": 1047,
    "slug": "reverse-string",
    "title": "Reverse String",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 64.3,
    "totalSubmissions": 197100,
    "description": [
      "Return the reverse of string `s`. Do it with the in-place two-pointer swap technique (conceptually O(1) extra space).",
      "From AlgoMaster **AM-600** (Two Pointers)."
    ],
    "examples": [
      {
        "input": "s = \"hello\"",
        "output": "\"olleh\""
      },
      {
        "input": "s = \"ab\"",
        "output": "\"ba\""
      }
    ],
    "constraints": [
      "0 <= s.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseString(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseString(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse_string(s):\n    pass\n"
    }
  },
  {
    "id": 1048,
    "slug": "find-first-occurrence",
    "title": "Find the Index of the First Occurrence (strStr)",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 47.9,
    "totalSubmissions": 84800,
    "description": [
      "Given two strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if it isn't present. An empty needle returns 0.",
      "From AlgoMaster **AM-600** (Strings / Two Pointers)."
    ],
    "examples": [
      {
        "input": "haystack = \"sadbutsad\", needle = \"sad\"",
        "output": "0"
      },
      {
        "input": "haystack = \"leetcode\", needle = \"leeto\"",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= haystack.length <= 10^4",
      "0 <= needle.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction strStr(haystack, needle) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction strStr(haystack, needle): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef str_str(haystack, needle):\n    pass\n"
    }
  },
  {
    "id": 1049,
    "slug": "rotate-array",
    "title": "Rotate Array",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 50.2,
    "totalSubmissions": 146400,
    "description": [
      "Rotate the array `nums` to the **right** by `k` steps (elements pushed off the end wrap to the front), in place, and return it. `k` can be larger than the length.",
      "From AlgoMaster **AM-600** (Arrays)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,4,5,6,7], k = 3",
        "output": "[5,6,7,1,2,3,4]"
      },
      {
        "input": "nums = [-1,-100,3,99], k = 2",
        "output": "[3,99,-1,-100]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "0 <= k <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rotate(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rotate(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef rotate(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1050,
    "slug": "reverse-words-in-a-string",
    "title": "Reverse Words in a String",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 47.2,
    "totalSubmissions": 131900,
    "description": [
      "Given a string `s`, reverse the **order of the words**. Words are separated by one or more spaces; the result must have words in reverse order joined by a single space, with no leading/trailing spaces.",
      "From AlgoMaster **AM-600** (Strings)."
    ],
    "examples": [
      {
        "input": "s = \"the sky is blue\"",
        "output": "\"blue is sky the\""
      },
      {
        "input": "s = \"  hello world  \"",
        "output": "\"world hello\""
      },
      {
        "input": "s = \"a good   example\"",
        "output": "\"example good a\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseWords(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseWords(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse_words(s):\n    pass\n"
    }
  },
  {
    "id": 1051,
    "slug": "count-binary-substrings",
    "title": "Count Binary Substrings",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 47.3,
    "totalSubmissions": 66000,
    "description": [
      "Given a binary string `s`, count the number of non-empty substrings that have **equal numbers of 0s and 1s**, where all the 0s and all the 1s are grouped consecutively (like `0011` or `10`). Substrings occurring multiple times are counted each time.",
      "From AlgoMaster **AM-600** (Two Pointers / Strings)."
    ],
    "examples": [
      {
        "input": "s = \"00110011\"",
        "output": "6",
        "explanation": "\"0011\",\"01\",\"1100\",\"10\",\"0011\",\"01\"."
      },
      {
        "input": "s = \"10101\"",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countBinarySubstrings(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countBinarySubstrings(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef count_binary_substrings(s):\n    pass\n"
    }
  },
  {
    "id": 1052,
    "slug": "remove-element",
    "title": "Remove Element",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 77.6,
    "totalSubmissions": 161400,
    "description": [
      "Given an array `nums` and a value `val`, remove all occurrences of `val` in place and return the resulting array (order of the kept elements preserved).",
      "From AlgoMaster **AM-600** (Arrays / Two Pointers)."
    ],
    "examples": [
      {
        "input": "nums = [3,2,2,3], val = 3",
        "output": "[2,2]"
      },
      {
        "input": "nums = [0,1,2,2,3,0,4,2], val = 2",
        "output": "[0,1,3,0,4]"
      }
    ],
    "constraints": [
      "0 <= nums.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeElement(nums, val) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeElement(nums, val): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_element(nums, val):\n    pass\n"
    }
  },
  {
    "id": 1053,
    "slug": "remove-duplicates-from-sorted-array",
    "title": "Remove Duplicates from Sorted Array",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 79.2,
    "totalSubmissions": 152300,
    "description": [
      "Given a **sorted** array `nums`, remove duplicates in place so each element appears once, and return the resulting array (in sorted order).",
      "From AlgoMaster **AM-600** (Arrays / Two Pointers)."
    ],
    "examples": [
      {
        "input": "nums = [1,1,2]",
        "output": "[1,2]"
      },
      {
        "input": "nums = [0,0,1,1,1,2,2,3,3,4]",
        "output": "[0,1,2,3,4]"
      }
    ],
    "constraints": [
      "0 <= nums.length <= 3·10^4",
      "nums is sorted non-decreasing"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeDuplicates(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeDuplicates(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_duplicates(nums):\n    pass\n"
    }
  },
  {
    "id": 1054,
    "slug": "remove-duplicates-from-sorted-array-ii",
    "title": "Remove Duplicates from Sorted Array II",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 40.6,
    "totalSubmissions": 57600,
    "description": [
      "Given a **sorted** array `nums`, remove duplicates in place so each element appears **at most twice**, and return the resulting array.",
      "From AlgoMaster **AM-600** (Arrays / Two Pointers)."
    ],
    "examples": [
      {
        "input": "nums = [1,1,1,2,2,3]",
        "output": "[1,1,2,2,3]"
      },
      {
        "input": "nums = [0,0,1,1,1,1,2,3,3]",
        "output": "[0,0,1,1,2,3,3]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 3·10^4",
      "nums is sorted non-decreasing"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeDuplicatesII(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeDuplicatesII(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_duplicates_i_i(nums):\n    pass\n"
    }
  },
  {
    "id": 1055,
    "slug": "length-of-last-word",
    "title": "Length of Last Word",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 73.5,
    "totalSubmissions": 174400,
    "description": [
      "Given a string `s` of words and spaces, return the length of the **last** word (a maximal run of non-space characters). There may be trailing spaces.",
      "From AlgoMaster **AM-600** (Strings)."
    ],
    "examples": [
      {
        "input": "s = \"Hello World\"",
        "output": "5"
      },
      {
        "input": "s = \"   fly me   to   the moon  \"",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLastWord(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLastWord(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef length_of_last_word(s):\n    pass\n"
    }
  },
  {
    "id": 1056,
    "slug": "one-edit-distance",
    "title": "One Edit Distance",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 34.5,
    "totalSubmissions": 252300,
    "description": [
      "Given strings `s` and `t`, return `true` if they are **exactly one edit** apart — one insert, one delete, or one replace (identical strings, or strings differing by more than one edit, return false).",
      "From AlgoMaster **AM-600** (Strings / Two Pointers)."
    ],
    "examples": [
      {
        "input": "s = \"ab\", t = \"acb\"",
        "output": "true",
        "explanation": "Insert 'c'."
      },
      {
        "input": "s = \"cab\", t = \"ad\"",
        "output": "false"
      },
      {
        "input": "s = \"1203\", t = \"1213\"",
        "output": "true",
        "explanation": "Replace '0' with '1'."
      }
    ],
    "constraints": [
      "0 <= s.length, t.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isOneEditDistance(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isOneEditDistance(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_one_edit_distance(s, t):\n    pass\n"
    }
  },
  {
    "id": 1057,
    "slug": "reverse-vowels-of-a-string",
    "title": "Reverse Vowels of a String",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 73.4,
    "totalSubmissions": 272100,
    "description": [
      "Given a string `s`, reverse only the **vowels** (`a e i o u`, both cases) and return the result. Non-vowel characters stay in place.",
      "Canonical must-do (AM-600 Two Pointers family)."
    ],
    "examples": [
      {
        "input": "s = \"hello\"",
        "output": "\"holle\""
      },
      {
        "input": "s = \"leetcode\"",
        "output": "\"leotcede\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 3·10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseVowels(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseVowels(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse_vowels(s):\n    pass\n"
    }
  },
  {
    "id": 1058,
    "slug": "sort-array-by-parity",
    "title": "Sort Array By Parity",
    "difficulty": "Easy",
    "tags": [
      "Two Pointers"
    ],
    "acceptanceRate": 64.9,
    "totalSubmissions": 235900,
    "description": [
      "Given an integer array `nums`, return an array with all the **even** integers first, followed by all the **odd** integers. Preserve each group's original relative order.",
      "Canonical must-do (AM-600 Two Pointers family)."
    ],
    "examples": [
      {
        "input": "nums = [3,1,2,4]",
        "output": "[2,4,3,1]"
      },
      {
        "input": "nums = [2,4]",
        "output": "[2,4]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortArrayByParity(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortArrayByParity(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sort_array_by_parity(nums):\n    pass\n"
    }
  },
  {
    "id": 1059,
    "slug": "best-time-to-buy-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 50.6,
    "totalSubmissions": 171600,
    "description": [
      "Given `prices` where `prices[i]` is a stock's price on day i, return the maximum profit from buying on one day and selling on a later day. If no profit is possible, return 0."
    ],
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "5",
        "explanation": "Buy at 1, sell at 6."
      },
      {
        "input": "prices = [7,6,4,3,1]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= prices.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProfit(prices) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProfit(prices): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_profit(prices):\n    pass\n"
    }
  },
  {
    "id": 1060,
    "slug": "longest-substring-without-repeating",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 55.3,
    "totalSubmissions": 37800,
    "description": [
      "Given a string `s`, return the length of the longest substring without repeating characters."
    ],
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "\"abc\"."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1"
      }
    ],
    "constraints": [
      "0 <= s.length <= 5 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLongestSubstring(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLongestSubstring(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef length_of_longest_substring(s):\n    pass\n"
    }
  },
  {
    "id": 1061,
    "slug": "longest-repeating-character-replacement",
    "title": "Longest Repeating Character Replacement",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 35.8,
    "totalSubmissions": 189000,
    "description": [
      "Given a string `s` (uppercase letters) and an integer `k`, you may replace up to `k` characters. Return the length of the longest substring of a single repeated letter you can then form."
    ],
    "examples": [
      {
        "input": "s = \"ABAB\", k = 2",
        "output": "4"
      },
      {
        "input": "s = \"AABABBA\", k = 1",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "0 <= k <= s.length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction characterReplacement(s, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction characterReplacement(s, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef character_replacement(s, k):\n    pass\n"
    }
  },
  {
    "id": 1062,
    "slug": "permutation-in-string",
    "title": "Permutation in String",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 62.4,
    "totalSubmissions": 260700,
    "description": [
      "Given strings `s1` and `s2`, return `true` if `s2` contains a substring that is a permutation of `s1` (a contiguous window with the same character counts)."
    ],
    "examples": [
      {
        "input": "s1 = \"ab\", s2 = \"eidbaooo\"",
        "output": "true",
        "explanation": "\"ba\" is a permutation of \"ab\"."
      },
      {
        "input": "s1 = \"ab\", s2 = \"eidboaoo\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s1.length, s2.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction checkInclusion(s1, s2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction checkInclusion(s1, s2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef check_inclusion(s1, s2):\n    pass\n"
    }
  },
  {
    "id": 1063,
    "slug": "max-consecutive-ones-iii",
    "title": "Max Consecutive Ones III",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 49.6,
    "totalSubmissions": 176900,
    "description": [
      "Given a binary array `nums` and an integer `k`, return the length of the longest run of 1s obtainable by flipping at most `k` zeros to 1."
    ],
    "examples": [
      {
        "input": "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2",
        "output": "6"
      },
      {
        "input": "nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3",
        "output": "10"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestOnes(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestOnes(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_ones(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1064,
    "slug": "minimum-window-substring",
    "title": "Minimum Window Substring",
    "difficulty": "Hard",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 30.8,
    "totalSubmissions": 126100,
    "description": [
      "Given strings `s` and `t`, return the shortest substring of `s` that contains every character of `t` (including multiplicities). If none exists, return the empty string."
    ],
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "output": "\"BANC\""
      },
      {
        "input": "s = \"a\", t = \"a\"",
        "output": "\"a\""
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minWindow(s, t) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minWindow(s, t): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_window(s, t):\n    pass\n"
    }
  },
  {
    "id": 1065,
    "slug": "maximum-average-subarray-i",
    "title": "Maximum Average Subarray I",
    "difficulty": "Easy",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 53.4,
    "totalSubmissions": 79800,
    "description": [
      "Return the maximum average of any contiguous subarray of length exactly `k`."
    ],
    "examples": [
      {
        "input": "nums = [1,12,-5,-6,50,3], k = 4",
        "output": "12.75",
        "explanation": "(12 − 5 − 6 + 50) / 4."
      },
      {
        "input": "nums = [5], k = 1",
        "output": "5"
      }
    ],
    "constraints": [
      "1 <= k <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMaxAverage(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMaxAverage(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_max_average(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1066,
    "slug": "minimum-size-subarray-sum",
    "title": "Minimum Size Subarray Sum",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 64.9,
    "totalSubmissions": 191500,
    "description": [
      "Given positive integers `nums` and a `target`, return the length of the SHORTEST contiguous subarray with sum ≥ target, or `0` if none exists."
    ],
    "examples": [
      {
        "input": "target = 7, nums = [2,3,1,2,4,3]",
        "output": "2",
        "explanation": "[4,3]."
      },
      {
        "input": "target = 4, nums = [1,4,4]",
        "output": "1"
      },
      {
        "input": "target = 11, nums = [1,1,1,1,1,1,1,1]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minSubArrayLen(target, nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minSubArrayLen(target, nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_sub_array_len(target, nums):\n    pass\n"
    }
  },
  {
    "id": 1067,
    "slug": "fruit-into-baskets",
    "title": "Fruit Into Baskets",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 52.4,
    "totalSubmissions": 103300,
    "description": [
      "`fruits[i]` is the type of the i-th tree's fruit. You have two baskets, each holding ONE type. Picking a contiguous run of trees, return the maximum number of fruits you can collect (i.e. the longest window with at most 2 distinct types)."
    ],
    "examples": [
      {
        "input": "fruits = [1,2,1]",
        "output": "3"
      },
      {
        "input": "fruits = [1,2,3,2,2]",
        "output": "4",
        "explanation": "[2,3,2,2]."
      },
      {
        "input": "fruits = [3,3,3,1,2,1,1,2,3,3,4]",
        "output": "5"
      }
    ],
    "constraints": [
      "1 <= fruits.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction totalFruit(fruits) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction totalFruit(fruits): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef total_fruit(fruits):\n    pass\n"
    }
  },
  {
    "id": 1068,
    "slug": "longest-subarray-of-ones-after-deleting",
    "title": "Longest Subarray of 1's After Deleting One Element",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 62.6,
    "totalSubmissions": 269000,
    "description": [
      "Given a binary array, you MUST delete exactly one element. Return the length of the longest run of 1's in the result."
    ],
    "examples": [
      {
        "input": "nums = [1,1,0,1]",
        "output": "3",
        "explanation": "Delete the 0."
      },
      {
        "input": "nums = [0,1,1,1,0,1,1,0,1]",
        "output": "5",
        "explanation": "Delete the middle 0 → [1,1,1,1,1] around it."
      },
      {
        "input": "nums = [1,1,1]",
        "output": "2",
        "explanation": "You must delete something."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestSubarray(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestSubarray(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_subarray(nums):\n    pass\n"
    }
  },
  {
    "id": 1069,
    "slug": "longest-substring-k-distinct",
    "title": "Longest Substring with At Most K Distinct Characters",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 57.7,
    "totalSubmissions": 53100,
    "description": [
      "Given a string `s` and an integer `k`, return the length of the longest substring that contains **at most `k` distinct** characters.",
      "From *interactive-coding-challenges* (Online Judges). This is the general form of Fruit Into Baskets (which is k = 2)."
    ],
    "examples": [
      {
        "input": "s = \"eceba\", k = 2",
        "output": "3",
        "explanation": "\"ece\" has 2 distinct characters."
      },
      {
        "input": "s = \"aa\", k = 1",
        "output": "2"
      }
    ],
    "constraints": [
      "0 <= s.length <= 5·10^4",
      "0 <= k <= 50"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLongestSubstringKDistinct(s, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLongestSubstringKDistinct(s, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef length_of_longest_substring_k_distinct(s, k):\n    pass\n"
    }
  },
  {
    "id": 1070,
    "slug": "max-consecutive-ones",
    "title": "Max Consecutive Ones",
    "difficulty": "Easy",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 67.2,
    "totalSubmissions": 137500,
    "description": [
      "Given a binary array `nums`, return the maximum number of consecutive `1`s.",
      "From AlgoMaster **AM-600** (Arrays). The zero-flip base case of Max Consecutive Ones III."
    ],
    "examples": [
      {
        "input": "nums = [1,1,0,1,1,1]",
        "output": "3"
      },
      {
        "input": "nums = [1,0,1,1,0,1]",
        "output": "2"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMaxConsecutiveOnes(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMaxConsecutiveOnes(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_max_consecutive_ones(nums):\n    pass\n"
    }
  },
  {
    "id": 1071,
    "slug": "find-all-anagrams-in-a-string",
    "title": "Find All Anagrams in a String",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 33.5,
    "totalSubmissions": 75800,
    "description": [
      "Given strings `s` and `p`, return an array of all **start indices** of `p`'s anagrams in `s`, in ascending order.",
      "Canonical must-do (AM-600 Sliding Window family)."
    ],
    "examples": [
      {
        "input": "s = \"cbaebabacd\", p = \"abc\"",
        "output": "[0,6]",
        "explanation": "\"cba\" at 0 and \"bac\" at 6."
      },
      {
        "input": "s = \"abab\", p = \"ab\"",
        "output": "[0,1,2]"
      }
    ],
    "constraints": [
      "1 <= s.length, p.length <= 3·10^4",
      "lowercase letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findAnagrams(s, p) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findAnagrams(s, p): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_anagrams(s, p):\n    pass\n"
    }
  },
  {
    "id": 1072,
    "slug": "subarray-product-less-than-k",
    "title": "Subarray Product Less Than K",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 64.6,
    "totalSubmissions": 89900,
    "description": [
      "Given an array of positive integers `nums` and an integer `k`, return the number of contiguous subarrays whose product is **strictly less than** `k`.",
      "Canonical must-do (AM-600 Sliding Window family)."
    ],
    "examples": [
      {
        "input": "nums = [10,5,2,6], k = 100",
        "output": "8"
      },
      {
        "input": "nums = [1,2,3], k = 0",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 3·10^4",
      "1 <= nums[i] <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numSubarrayProductLessThanK(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numSubarrayProductLessThanK(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_subarray_product_less_than_k(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1073,
    "slug": "maximum-erasure-value",
    "title": "Maximum Erasure Value",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 53.7,
    "totalSubmissions": 155200,
    "description": [
      "Given an array of positive integers `nums`, find the maximum **sum** of a contiguous subarray whose elements are all **distinct**.",
      "Canonical must-do (AM-600 Sliding Window family)."
    ],
    "examples": [
      {
        "input": "nums = [4,2,4,5,6]",
        "output": "17",
        "explanation": "[2,4,5,6] sums to 17."
      },
      {
        "input": "nums = [5,2,1,2,5,2,1,2,5]",
        "output": "8"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximumUniqueSubarray(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximumUniqueSubarray(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef maximum_unique_subarray(nums):\n    pass\n"
    }
  },
  {
    "id": 1074,
    "slug": "substrings-containing-all-three",
    "title": "Number of Substrings Containing All Three Characters",
    "difficulty": "Medium",
    "tags": [
      "Sliding Window"
    ],
    "acceptanceRate": 59,
    "totalSubmissions": 149200,
    "description": [
      "Given a string `s` of only the characters `a`, `b`, and `c`, return the number of substrings that contain **at least one of each**.",
      "Canonical must-do (AM-600 Sliding Window family)."
    ],
    "examples": [
      {
        "input": "s = \"abcabc\"",
        "output": "10"
      },
      {
        "input": "s = \"aaacb\"",
        "output": "3"
      },
      {
        "input": "s = \"abc\"",
        "output": "1"
      }
    ],
    "constraints": [
      "3 <= s.length <= 5·10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numberOfSubstrings(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numberOfSubstrings(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef number_of_substrings(s):\n    pass\n"
    }
  },
  {
    "id": 1075,
    "slug": "evaluate-rpn",
    "title": "Evaluate Reverse Polish Notation",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 34.2,
    "totalSubmissions": 248600,
    "description": [
      "Evaluate an arithmetic expression in Reverse Polish (postfix) Notation given as `tokens`. Valid operators are `+ - * /`; division truncates toward zero."
    ],
    "examples": [
      {
        "input": "tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]",
        "output": "9",
        "explanation": "(2 + 1) * 3."
      },
      {
        "input": "tokens = [\"4\",\"13\",\"5\",\"/\",\"+\"]",
        "output": "6"
      }
    ],
    "constraints": [
      "1 <= tokens.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction evalRPN(tokens) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction evalRPN(tokens): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef eval_r_p_n(tokens):\n    pass\n"
    }
  },
  {
    "id": 1076,
    "slug": "daily-temperatures",
    "title": "Daily Temperatures",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 47.3,
    "totalSubmissions": 35100,
    "description": [
      "Given daily `temperatures`, return an array where `answer[i]` is the number of days until a warmer temperature. If none exists, use 0."
    ],
    "examples": [
      {
        "input": "temperatures = [73,74,75,71,69,72,76,73]",
        "output": "[1,1,4,2,1,1,0,0]"
      },
      {
        "input": "temperatures = [30,40,50,60]",
        "output": "[1,1,1,0]"
      }
    ],
    "constraints": [
      "1 <= temperatures.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction dailyTemperatures(temperatures) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction dailyTemperatures(temperatures): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef daily_temperatures(temperatures):\n    pass\n"
    }
  },
  {
    "id": 1077,
    "slug": "generate-parentheses",
    "title": "Generate Parentheses",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 33.8,
    "totalSubmissions": 53000,
    "description": [
      "Given `n` pairs of parentheses, return all combinations of well-formed parentheses. Any order is fine."
    ],
    "examples": [
      {
        "input": "n = 3",
        "output": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]"
      },
      {
        "input": "n = 1",
        "output": "[\"()\"]"
      }
    ],
    "constraints": [
      "1 <= n <= 8"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction generateParenthesis(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction generateParenthesis(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef generate_parenthesis(n):\n    pass\n"
    }
  },
  {
    "id": 1078,
    "slug": "car-fleet",
    "title": "Car Fleet",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 36.6,
    "totalSubmissions": 94600,
    "description": [
      "Cars head to a `target` mile marker. Car i starts at `position[i]` with constant `speed[i]`; a faster car catches up to a slower one ahead and then travels as a fleet at the slower speed. Return the number of fleets that arrive."
    ],
    "examples": [
      {
        "input": "target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]",
        "output": "3"
      },
      {
        "input": "target = 10, position = [3], speed = [3]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= position.length <= 10^5",
      "0 < speed[i]"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction carFleet(target, position, speed) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction carFleet(target, position, speed): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef car_fleet(target, position, speed):\n    pass\n"
    }
  },
  {
    "id": 1079,
    "slug": "largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 36.1,
    "totalSubmissions": 19700,
    "description": [
      "Given `heights` of adjacent unit-width bars, return the area of the largest rectangle that fits entirely under the histogram."
    ],
    "examples": [
      {
        "input": "heights = [2,1,5,6,2,3]",
        "output": "10",
        "explanation": "Bars 5 and 6 give 5×2."
      },
      {
        "input": "heights = [2,4]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= heights.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction largestRectangleArea(heights) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction largestRectangleArea(heights): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef largest_rectangle_area(heights):\n    pass\n"
    }
  },
  {
    "id": 1080,
    "slug": "min-stack",
    "title": "Min Stack",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 50.3,
    "totalSubmissions": 145600,
    "description": [
      "Implement a stack supporting `push`, `pop`, `top`, and `getMin` (retrieve the minimum element), each in O(1) time. Process the operations in `ops` (with `args[i]` as arguments) and return each operation's result (`null` for push/pop)."
    ],
    "examples": [
      {
        "input": "ops = [\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"], args = [[-2],[0],[-3],[],[],[],[]]",
        "output": "[null,null,null,-3,null,0,-2]"
      }
    ],
    "constraints": [
      "Operations are always valid (no pop/top on empty)"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minStack(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minStack(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_stack(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1081,
    "slug": "simplify-path",
    "title": "Simplify Path",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 33.6,
    "totalSubmissions": 112200,
    "description": [
      "Convert an absolute Unix `path` to its canonical form: single slashes, no trailing slash, `.` (current dir) removed, `..` (parent dir) resolved."
    ],
    "examples": [
      {
        "input": "path = \"/home/\"",
        "output": "\"/home\""
      },
      {
        "input": "path = \"/../\"",
        "output": "\"/\"",
        "explanation": "You cannot go above the root."
      },
      {
        "input": "path = \"/a/./b/../../c/\"",
        "output": "\"/c\""
      }
    ],
    "constraints": [
      "1 <= path.length <= 3000",
      "path starts with '/'"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction simplifyPath(path) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction simplifyPath(path): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef simplify_path(path):\n    pass\n"
    }
  },
  {
    "id": 1082,
    "slug": "decode-string",
    "title": "Decode String",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 61.5,
    "totalSubmissions": 260100,
    "description": [
      "Decode strings of the form `k[inner]`, where `inner` is repeated `k` times; encodings can nest. Return the decoded string."
    ],
    "examples": [
      {
        "input": "s = \"3[a]2[bc]\"",
        "output": "\"aaabcbc\""
      },
      {
        "input": "s = \"3[a2[c]]\"",
        "output": "\"accaccacc\""
      },
      {
        "input": "s = \"2[abc]3[cd]ef\"",
        "output": "\"abcabccdcdcdef\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 30",
      "Counts are 1–300; result length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction decodeString(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction decodeString(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef decode_string(s):\n    pass\n"
    }
  },
  {
    "id": 1083,
    "slug": "asteroid-collision",
    "title": "Asteroid Collision",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 42.4,
    "totalSubmissions": 144700,
    "description": [
      "Asteroids move along a line: positive values move right, negative move left, all at equal speed; `|value|` is size. When two collide the smaller explodes (both, if equal). Return the surviving asteroids in order."
    ],
    "examples": [
      {
        "input": "asteroids = [5,10,-5]",
        "output": "[5,10]",
        "explanation": "10 destroys -5."
      },
      {
        "input": "asteroids = [8,-8]",
        "output": "[]"
      },
      {
        "input": "asteroids = [10,2,-5]",
        "output": "[10]"
      }
    ],
    "constraints": [
      "2 <= asteroids.length <= 10^4",
      "No zeros"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction asteroidCollision(asteroids) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction asteroidCollision(asteroids): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef asteroid_collision(asteroids):\n    pass\n"
    }
  },
  {
    "id": 1084,
    "slug": "implement-queue-using-stacks",
    "title": "Implement Queue Using Two Stacks",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 55.7,
    "totalSubmissions": 244800,
    "description": [
      "Implement a FIFO queue using only two stacks. Support `push` (enqueue), `pop` (dequeue and return the front), `peek` (return the front), and `empty` (is it empty?). Process the operations in `ops` with arguments `args[i]`, and return each operation's result (`null` for push).",
      "From *interactive-coding-challenges* (Stacks & Queues: implement a queue using two stacks)."
    ],
    "examples": [
      {
        "input": "ops = [\"push\",\"push\",\"peek\",\"pop\",\"empty\"], args = [[1],[2],[],[],[]]",
        "output": "[null,null,1,1,false]"
      }
    ],
    "constraints": [
      "1 <= x <= 9",
      "At most 100 operations; pop/peek only on a non-empty queue"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction queueUsingStacks(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction queueUsingStacks(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef queue_using_stacks(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1085,
    "slug": "sort-stack",
    "title": "Sort a Stack",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 63,
    "totalSubmissions": 182600,
    "description": [
      "Given the contents of a stack as an array `arr` (index 0 is the bottom, the last index is the top), return the sorted contents (ascending, so the largest ends on top) — using only **one additional stack** as a buffer (no arrays, no built-in sort).",
      "From *interactive-coding-challenges* (Stacks & Queues: sort a stack using another stack as a buffer)."
    ],
    "examples": [
      {
        "input": "arr = [3,1,2]",
        "output": "[1,2,3]"
      },
      {
        "input": "arr = [5,2,9,1]",
        "output": "[1,2,5,9]"
      }
    ],
    "constraints": [
      "0 <= arr.length <= 10^3"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortStack(arr) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortStack(arr): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sort_stack(arr):\n    pass\n"
    }
  },
  {
    "id": 1086,
    "slug": "minimum-add-to-make-parentheses-valid",
    "title": "Minimum Add to Make Parentheses Valid",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 50.5,
    "totalSubmissions": 89100,
    "description": [
      "Given a string `s` of `(` and `)`, return the minimum number of parentheses you must insert (anywhere) to make it valid (every open has a matching close and vice-versa).",
      "Canonical must-do (AM-600 Stack family)."
    ],
    "examples": [
      {
        "input": "s = \"())\"",
        "output": "1"
      },
      {
        "input": "s = \"(((\"",
        "output": "3"
      },
      {
        "input": "s = \"()))((\"",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= s.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minAddToMakeValid(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minAddToMakeValid(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_add_to_make_valid(s):\n    pass\n"
    }
  },
  {
    "id": 1087,
    "slug": "remove-all-adjacent-duplicates-in-string",
    "title": "Remove All Adjacent Duplicates in String",
    "difficulty": "Easy",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 75,
    "totalSubmissions": 262200,
    "description": [
      "Repeatedly remove two **adjacent, equal** characters from `s` until none remain, and return the final string. The result is unique regardless of removal order.",
      "Canonical must-do (AM-600 Stack family)."
    ],
    "examples": [
      {
        "input": "s = \"abbaca\"",
        "output": "\"ca\"",
        "explanation": "\"bb\" → \"aaca\" → \"aa\" → \"ca\"."
      },
      {
        "input": "s = \"azxxzy\"",
        "output": "\"ay\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeAdjacentDuplicates(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeAdjacentDuplicates(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_adjacent_duplicates(s):\n    pass\n"
    }
  },
  {
    "id": 1088,
    "slug": "basic-calculator-ii",
    "title": "Basic Calculator II",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 40.4,
    "totalSubmissions": 128000,
    "description": [
      "Evaluate a simple expression string `s` containing non-negative integers and the operators `+ - * /`, separated by optional spaces (no parentheses). Integer division **truncates toward zero**. Respect operator precedence.",
      "Canonical must-do (AM-600 Stack family)."
    ],
    "examples": [
      {
        "input": "s = \"3+2*2\"",
        "output": "7"
      },
      {
        "input": "s = \" 3/2 \"",
        "output": "1"
      },
      {
        "input": "s = \" 3+5 / 2 \"",
        "output": "5"
      }
    ],
    "constraints": [
      "1 <= s.length <= 3·10^5",
      "The expression is always valid"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction calculate(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction calculate(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef calculate(s):\n    pass\n"
    }
  },
  {
    "id": 1089,
    "slug": "score-of-parentheses",
    "title": "Score of Parentheses",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 54.6,
    "totalSubmissions": 214400,
    "description": [
      "Given a balanced parentheses string `s`, compute its score by the rules: `\"()\"` scores 1, `AB` scores `A + B` (concatenation), and `(A)` scores `2 * A`.",
      "Canonical must-do (AM-600 Stack family)."
    ],
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "1"
      },
      {
        "input": "s = \"(())\"",
        "output": "2"
      },
      {
        "input": "s = \"()()\"",
        "output": "2"
      }
    ],
    "constraints": [
      "2 <= s.length <= 50",
      "s is a balanced parentheses string"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction scoreOfParentheses(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction scoreOfParentheses(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef score_of_parentheses(s):\n    pass\n"
    }
  },
  {
    "id": 1090,
    "slug": "validate-stack-sequences",
    "title": "Validate Stack Sequences",
    "difficulty": "Medium",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 59.7,
    "totalSubmissions": 272600,
    "description": [
      "Given two arrays `pushed` and `popped` (both permutations of distinct values), return `true` if they could be the push and pop sequences of the **same** stack.",
      "Canonical must-do (AM-600 Stack family)."
    ],
    "examples": [
      {
        "input": "pushed = [1,2,3,4,5], popped = [4,5,3,2,1]",
        "output": "true"
      },
      {
        "input": "pushed = [1,2,3,4,5], popped = [4,3,5,1,2]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= pushed.length <= 1000",
      "values are distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validateStackSequences(pushed, popped) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validateStackSequences(pushed, popped): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef validate_stack_sequences(pushed, popped):\n    pass\n"
    }
  },
  {
    "id": 1091,
    "slug": "make-the-string-great",
    "title": "Make The String Great",
    "difficulty": "Easy",
    "tags": [
      "Stack"
    ],
    "acceptanceRate": 69.7,
    "totalSubmissions": 234400,
    "description": [
      "A string is **good** if it has no two adjacent characters that are the same letter in **opposite cases** (like `aA` or `Bb`). Repeatedly remove such pairs and return the resulting good string.",
      "Canonical must-do (AM-600 Stack family)."
    ],
    "examples": [
      {
        "input": "s = \"leEeetcode\"",
        "output": "\"leetcode\""
      },
      {
        "input": "s = \"abBAcC\"",
        "output": "\"\"",
        "explanation": "bB → aAcC → cC → empty."
      }
    ],
    "constraints": [
      "1 <= s.length <= 100",
      "letters only"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction makeGood(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction makeGood(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef make_good(s):\n    pass\n"
    }
  },
  {
    "id": 1092,
    "slug": "next-greater-element-i",
    "title": "Next Greater Element I",
    "difficulty": "Easy",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 79.7,
    "totalSubmissions": 75300,
    "description": [
      "You are given two arrays: `nums1` is a subset of `nums2` (all values distinct). For each value in `nums1`, find the first element to its RIGHT in `nums2` that is strictly greater. Return the answers in `nums1` order; use `-1` if none exists."
    ],
    "examples": [
      {
        "input": "nums1 = [4,1,2], nums2 = [1,3,4,2]",
        "output": "[-1,3,-1]",
        "explanation": "After 4 nothing is greater; after 1 comes 3; after 2 nothing."
      },
      {
        "input": "nums1 = [2,4], nums2 = [1,2,3,4]",
        "output": "[3,-1]"
      }
    ],
    "constraints": [
      "1 <= nums1.length <= nums2.length <= 1000",
      "All values distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextGreaterElement(nums1, nums2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextGreaterElement(nums1, nums2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef next_greater_element(nums1, nums2):\n    pass\n"
    }
  },
  {
    "id": 1093,
    "slug": "final-prices-with-discount",
    "title": "Final Prices With a Special Discount",
    "difficulty": "Easy",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 58.5,
    "totalSubmissions": 142700,
    "description": [
      "In a shop, the item at index `i` gets a discount equal to the FIRST price at an index `j > i` with `prices[j] <= prices[i]` (if any). Return the final price of every item."
    ],
    "examples": [
      {
        "input": "prices = [8,4,6,2,3]",
        "output": "[4,2,4,2,3]",
        "explanation": "8 is discounted by 4, 4 by 2, 6 by 2; 2 and 3 get none."
      },
      {
        "input": "prices = [1,2,3,4,5]",
        "output": "[1,2,3,4,5]"
      }
    ],
    "constraints": [
      "1 <= prices.length <= 500",
      "1 <= prices[i] <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction finalPrices(prices) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction finalPrices(prices): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef final_prices(prices):\n    pass\n"
    }
  },
  {
    "id": 1094,
    "slug": "stock-spans",
    "title": "Online Stock Span",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 50.4,
    "totalSubmissions": 263600,
    "description": [
      "Given daily stock `prices`, return for each day its SPAN: the number of consecutive days ending today with price less than or equal to today's price."
    ],
    "examples": [
      {
        "input": "prices = [100,80,60,70,60,75,85]",
        "output": "[1,1,1,2,1,4,6]",
        "explanation": "75 covers 60,70,60,75 → span 4."
      },
      {
        "input": "prices = [31,41,48,59,79]",
        "output": "[1,2,3,4,5]"
      }
    ],
    "constraints": [
      "1 <= prices.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction stockSpans(prices) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction stockSpans(prices): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef stock_spans(prices):\n    pass\n"
    }
  },
  {
    "id": 1095,
    "slug": "next-greater-element-ii",
    "title": "Next Greater Element II",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 48.8,
    "totalSubmissions": 73100,
    "description": [
      "Given a CIRCULAR array `nums` (the element after the last is the first), return the next greater element for every position, or `-1` if none exists."
    ],
    "examples": [
      {
        "input": "nums = [1,2,1]",
        "output": "[2,-1,2]",
        "explanation": "The last 1 wraps around to find 2."
      },
      {
        "input": "nums = [1,2,3,4,3]",
        "output": "[2,3,4,-1,4]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextGreaterElements(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextGreaterElements(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef next_greater_elements(nums):\n    pass\n"
    }
  },
  {
    "id": 1096,
    "slug": "remove-k-digits",
    "title": "Remove K Digits",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 34.5,
    "totalSubmissions": 266900,
    "description": [
      "Given a string `num` representing a non-negative integer and an integer `k`, remove exactly `k` digits so the remaining number is as SMALL as possible. Return it without leading zeros (return \"0\" if empty)."
    ],
    "examples": [
      {
        "input": "num = \"1432219\", k = 3",
        "output": "\"1219\"",
        "explanation": "Remove 4, 3, and one 2."
      },
      {
        "input": "num = \"10200\", k = 1",
        "output": "\"200\""
      },
      {
        "input": "num = \"10\", k = 2",
        "output": "\"0\""
      }
    ],
    "constraints": [
      "1 <= k <= num.length <= 10^5",
      "num has no leading zeros itself (except \"0\")"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeKdigits(num, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeKdigits(num, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_kdigits(num, k):\n    pass\n"
    }
  },
  {
    "id": 1097,
    "slug": "132-pattern",
    "title": "132 Pattern",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 58.9,
    "totalSubmissions": 194900,
    "description": [
      "Return `true` if `nums` contains a 132 pattern: indices `i < j < k` with `nums[i] < nums[k] < nums[j]` (small, then big, then middle)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "false"
      },
      {
        "input": "nums = [3,1,4,2]",
        "output": "true",
        "explanation": "[1, 4, 2]."
      },
      {
        "input": "nums = [-1,3,2,0]",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2 * 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction find132pattern(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction find132pattern(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find132pattern(nums):\n    pass\n"
    }
  },
  {
    "id": 1098,
    "slug": "sum-of-subarray-minimums",
    "title": "Sum of Subarray Minimums",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 59.7,
    "totalSubmissions": 112800,
    "description": [
      "Given an array `arr`, compute the sum of `min(b)` over EVERY contiguous subarray `b`, modulo 10^9 + 7."
    ],
    "examples": [
      {
        "input": "arr = [3,1,2,4]",
        "output": "17",
        "explanation": "Minimums: 3,1,2,4,1,1,2,1,1,1 → 17."
      },
      {
        "input": "arr = [11,81,94,43,3]",
        "output": "444"
      }
    ],
    "constraints": [
      "1 <= arr.length <= 3 * 10^4",
      "1 <= arr[i] <= 3 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sumSubarrayMins(arr) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sumSubarrayMins(arr): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sum_subarray_mins(arr):\n    pass\n"
    }
  },
  {
    "id": 1099,
    "slug": "remove-duplicate-letters",
    "title": "Remove Duplicate Letters",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 52,
    "totalSubmissions": 167600,
    "description": [
      "Given a string `s`, remove duplicate letters so every letter appears exactly once, and the result is the smallest in lexicographical order among all possible answers."
    ],
    "examples": [
      {
        "input": "s = \"bcabc\"",
        "output": "\"abc\""
      },
      {
        "input": "s = \"cbacdcbc\"",
        "output": "\"acdb\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of lowercase letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeDuplicateLetters(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeDuplicateLetters(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_duplicate_letters(s):\n    pass\n"
    }
  },
  {
    "id": 1100,
    "slug": "sliding-window-maximum",
    "title": "Sliding Window Maximum",
    "difficulty": "Hard",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 35.6,
    "totalSubmissions": 146400,
    "description": [
      "Given an array `nums` and window size `k`, return the maximum of every contiguous window of size `k`, left to right."
    ],
    "examples": [
      {
        "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        "output": "[3,3,5,5,6,7]"
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]"
      }
    ],
    "constraints": [
      "1 <= k <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxSlidingWindow(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxSlidingWindow(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_sliding_window(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1101,
    "slug": "shortest-subarray-with-sum-at-least-k",
    "title": "Shortest Subarray With Sum ≥ K",
    "difficulty": "Hard",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 43.2,
    "totalSubmissions": 232400,
    "description": [
      "Return the length of the SHORTEST non-empty subarray of `nums` with sum at least `k`, or `-1` if none exists. `nums` may contain negative numbers."
    ],
    "examples": [
      {
        "input": "nums = [1], k = 1",
        "output": "1"
      },
      {
        "input": "nums = [1,2], k = 4",
        "output": "-1"
      },
      {
        "input": "nums = [2,-1,2], k = 3",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^5 <= nums[i] <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction shortestSubarray(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction shortestSubarray(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef shortest_subarray(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1102,
    "slug": "shortest-unsorted-continuous-subarray",
    "title": "Shortest Unsorted Continuous Subarray",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 58.1,
    "totalSubmissions": 238500,
    "description": [
      "Given an integer array `nums`, find the **shortest contiguous subarray** such that sorting only that subarray makes the entire array sorted ascending. Return its length (0 if already sorted).",
      "Canonical must-do (AM-600 Monotonic family)."
    ],
    "examples": [
      {
        "input": "nums = [2,6,4,8,10,9,15]",
        "output": "5",
        "explanation": "Sort [6,4,8,10,9]."
      },
      {
        "input": "nums = [1,2,3,4]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findUnsortedSubarray(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findUnsortedSubarray(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_unsorted_subarray(nums):\n    pass\n"
    }
  },
  {
    "id": 1103,
    "slug": "maximum-width-ramp",
    "title": "Maximum Width Ramp",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 61.5,
    "totalSubmissions": 260900,
    "description": [
      "A **ramp** is a pair `(i, j)` with `i < j` and `nums[i] <= nums[j]`; its width is `j - i`. Given `nums`, return the maximum width of any ramp, or 0 if none exists.",
      "Canonical must-do (AM-600 Monotonic family)."
    ],
    "examples": [
      {
        "input": "nums = [6,0,8,2,1,5]",
        "output": "4",
        "explanation": "(1, 5): nums[1]=0 <= nums[5]=5."
      },
      {
        "input": "nums = [9,8,1,0,1,9,4,0,4,1]",
        "output": "7"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 5·10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxWidthRamp(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxWidthRamp(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_width_ramp(nums):\n    pass\n"
    }
  },
  {
    "id": 1104,
    "slug": "number-of-visible-people-in-a-queue",
    "title": "Number of Visible People in a Queue",
    "difficulty": "Hard",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 44.2,
    "totalSubmissions": 68000,
    "description": [
      "People stand in a line with the given `heights`. Person `i` can see person `j` (with `i < j`) if **everyone strictly between them is shorter than both**. Return an array where `answer[i]` is how many people person `i` can see to their right.",
      "Canonical must-do (AM-600 Monotonic Stack family)."
    ],
    "examples": [
      {
        "input": "heights = [10,6,8,5,11,9]",
        "output": "[3,1,2,1,1,0]"
      },
      {
        "input": "heights = [5,1,2,3,10]",
        "output": "[4,1,1,1,0]"
      }
    ],
    "constraints": [
      "1 <= heights.length <= 10^5",
      "heights are distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canSeePersonsCount(heights) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canSeePersonsCount(heights): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_see_persons_count(heights):\n    pass\n"
    }
  },
  {
    "id": 1105,
    "slug": "sum-of-subarray-ranges",
    "title": "Sum of Subarray Ranges",
    "difficulty": "Medium",
    "tags": [
      "Monotonic Stack & Queue"
    ],
    "acceptanceRate": 33.7,
    "totalSubmissions": 52100,
    "description": [
      "The **range** of a subarray is its largest element minus its smallest. Given `nums`, return the sum of the ranges of **all** its subarrays.",
      "Canonical must-do (AM-600 Monotonic Stack family). The companion to Sum of Subarray Minimums."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "4",
        "explanation": "Ranges: 0,0,0,1,1,2."
      },
      {
        "input": "nums = [4,-2,-3,4,1]",
        "output": "59"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 1000",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subArrayRanges(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subArrayRanges(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sub_array_ranges(nums):\n    pass\n"
    }
  },
  {
    "id": 1106,
    "slug": "search-a-2d-matrix",
    "title": "Search a 2D Matrix",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 36.5,
    "totalSubmissions": 122000,
    "description": [
      "Each row of `matrix` is sorted ascending, and the first value of each row exceeds the last of the previous row. Return `true` if `target` is present."
    ],
    "examples": [
      {
        "input": "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3",
        "output": "true"
      },
      {
        "input": "same matrix, target = 13",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchMatrix(matrix, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchMatrix(matrix, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef search_matrix(matrix, target):\n    pass\n"
    }
  },
  {
    "id": 1107,
    "slug": "koko-eating-bananas",
    "title": "Koko Eating Bananas",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 36.8,
    "totalSubmissions": 161600,
    "description": [
      "Koko eats from `piles`; at speed k she eats k bananas/hour from one pile (finishing a smaller pile early). Return the minimum integer k that finishes all piles within `h` hours."
    ],
    "examples": [
      {
        "input": "piles = [3,6,7,11], h = 8",
        "output": "4"
      },
      {
        "input": "piles = [30,11,23,4,20], h = 5",
        "output": "30"
      }
    ],
    "constraints": [
      "1 <= piles.length <= 10^4",
      "piles.length <= h"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minEatingSpeed(piles, h) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minEatingSpeed(piles, h): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_eating_speed(piles, h):\n    pass\n"
    }
  },
  {
    "id": 1108,
    "slug": "find-minimum-in-rotated-sorted-array",
    "title": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 52.2,
    "totalSubmissions": 261800,
    "description": [
      "A sorted ascending array of distinct values was rotated at an unknown pivot. Return its minimum in O(log n)."
    ],
    "examples": [
      {
        "input": "nums = [3,4,5,1,2]",
        "output": "1"
      },
      {
        "input": "nums = [4,5,6,7,0,1,2]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5000",
      "all distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMin(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMin(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_min(nums):\n    pass\n"
    }
  },
  {
    "id": 1109,
    "slug": "search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 58.8,
    "totalSubmissions": 240600,
    "description": [
      "Given a rotated sorted array of distinct integers `nums` and a `target`, return its index or -1, in O(log n)."
    ],
    "examples": [
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 0",
        "output": "4"
      },
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 3",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5000",
      "all distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchRotated(nums, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchRotated(nums, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef search_rotated(nums, target):\n    pass\n"
    }
  },
  {
    "id": 1110,
    "slug": "search-insert-position",
    "title": "Search Insert Position",
    "difficulty": "Easy",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 46.5,
    "totalSubmissions": 229300,
    "description": [
      "Given a sorted array of distinct integers and a `target`, return the index of the target, or the index where it WOULD be inserted to keep the array sorted. O(log n) required."
    ],
    "examples": [
      {
        "input": "nums = [1,3,5,6], target = 5",
        "output": "2"
      },
      {
        "input": "nums = [1,3,5,6], target = 2",
        "output": "1"
      },
      {
        "input": "nums = [1,3,5,6], target = 7",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "Distinct, sorted ascending"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchInsert(nums, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchInsert(nums, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef search_insert(nums, target):\n    pass\n"
    }
  },
  {
    "id": 1111,
    "slug": "find-peak-element",
    "title": "Find Peak Element",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 41.8,
    "totalSubmissions": 258300,
    "description": [
      "A peak is an element strictly greater than its neighbours (out-of-bounds counts as −∞). Given `nums` where adjacent elements differ, return the index of a peak, in O(log n). The tests use arrays with a single peak."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "2"
      },
      {
        "input": "nums = [3,2,1]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 1000",
      "nums[i] !== nums[i+1]"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findPeakElement(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findPeakElement(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_peak_element(nums):\n    pass\n"
    }
  },
  {
    "id": 1112,
    "slug": "capacity-to-ship-packages",
    "title": "Capacity to Ship Packages Within D Days",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 47.4,
    "totalSubmissions": 260600,
    "description": [
      "Packages with given `weights` must ship IN ORDER, one contiguous batch per day. Return the least ship capacity that ships everything within `days` days."
    ],
    "examples": [
      {
        "input": "weights = [1,2,3,4,5,6,7,8,9,10], days = 5",
        "output": "15",
        "explanation": "Days: [1..5], [6,7], [8], [9], [10]."
      },
      {
        "input": "weights = [3,2,2,4,1,4], days = 3",
        "output": "6"
      }
    ],
    "constraints": [
      "1 <= weights.length <= 5 * 10^4",
      "1 <= days <= weights.length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction shipWithinDays(weights, days) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction shipWithinDays(weights, days): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef ship_within_days(weights, days):\n    pass\n"
    }
  },
  {
    "id": 1113,
    "slug": "split-array-largest-sum",
    "title": "Split Array Largest Sum",
    "difficulty": "Hard",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 33.2,
    "totalSubmissions": 234000,
    "description": [
      "Split `nums` into `k` non-empty CONTIGUOUS subarrays so that the largest subarray sum is as small as possible; return that minimized largest sum."
    ],
    "examples": [
      {
        "input": "nums = [7,2,5,10,8], k = 2",
        "output": "18",
        "explanation": "[7,2,5] and [10,8]."
      },
      {
        "input": "nums = [1,2,3,4,5], k = 2",
        "output": "9",
        "explanation": "[1,2,3] and [4,5]."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 1000",
      "1 <= k <= nums.length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction splitArray(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction splitArray(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef split_array(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1114,
    "slug": "magic-index",
    "title": "Magic Index",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 58.7,
    "totalSubmissions": 232900,
    "description": [
      "A **magic index** in an array is an index `i` where `arr[i] === i`. Given a **sorted array of distinct integers**, return the smallest magic index, or `-1` if none exists.",
      "From *interactive-coding-challenges* (Recursion & DP: find the magic index) — solved with binary search."
    ],
    "examples": [
      {
        "input": "arr = [-1,0,2,4,5]",
        "output": "2",
        "explanation": "arr[2] === 2."
      },
      {
        "input": "arr = [1,2,3,4]",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= arr.length <= 10^5",
      "arr is sorted ascending with distinct integers"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction magicIndex(arr) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction magicIndex(arr): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef magic_index(arr):\n    pass\n"
    }
  },
  {
    "id": 1115,
    "slug": "find-first-and-last-position",
    "title": "Find First and Last Position of Element",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 62.8,
    "totalSubmissions": 181500,
    "description": [
      "Given a sorted array `nums` and a `target`, return `[firstIndex, lastIndex]` of the target's range, or `[-1, -1]` if absent. Must run in O(log n).",
      "Canonical must-do (AM-600 Binary Search family)."
    ],
    "examples": [
      {
        "input": "nums = [5,7,7,8,8,10], target = 8",
        "output": "[3,4]"
      },
      {
        "input": "nums = [5,7,7,8,8,10], target = 6",
        "output": "[-1,-1]"
      }
    ],
    "constraints": [
      "0 <= nums.length <= 10^5",
      "nums is sorted non-decreasing"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchRange(nums, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction searchRange(nums, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef search_range(nums, target):\n    pass\n"
    }
  },
  {
    "id": 1116,
    "slug": "single-element-in-sorted-array",
    "title": "Single Element in a Sorted Array",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 56.4,
    "totalSubmissions": 176200,
    "description": [
      "In a sorted array where every element appears exactly twice except one that appears once, return the single element. Must run in O(log n) time.",
      "Canonical must-do (AM-600 Binary Search family)."
    ],
    "examples": [
      {
        "input": "nums = [1,1,2,3,3,4,4,8,8]",
        "output": "2"
      },
      {
        "input": "nums = [3,3,7,7,10,11,11]",
        "output": "10"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "nums.length is odd"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNonDuplicate(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNonDuplicate(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef single_non_duplicate(nums):\n    pass\n"
    }
  },
  {
    "id": 1117,
    "slug": "first-bad-version",
    "title": "First Bad Version",
    "difficulty": "Easy",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 45.5,
    "totalSubmissions": 269300,
    "description": [
      "Versions `1..n` are in order; once a version is bad, every later one is bad too. Given `n` and the first bad version `bad`, return the first bad version using as few checks as possible (binary search).",
      "Canonical must-do (AM-600 Binary Search family). (Normally `isBadVersion` is an API; here `bad` is passed in.)"
    ],
    "examples": [
      {
        "input": "n = 5, bad = 4",
        "output": "4"
      },
      {
        "input": "n = 1, bad = 1",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= bad <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction firstBadVersion(n, bad) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction firstBadVersion(n, bad): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef first_bad_version(n, bad):\n    pass\n"
    }
  },
  {
    "id": 1118,
    "slug": "valid-perfect-square",
    "title": "Valid Perfect Square",
    "difficulty": "Easy",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 79.2,
    "totalSubmissions": 291400,
    "description": [
      "Given a positive integer `num`, return `true` if it is a perfect square (the square of an integer). Do **not** use any built-in square-root function.",
      "Canonical must-do (AM-600 Binary Search family)."
    ],
    "examples": [
      {
        "input": "num = 16",
        "output": "true"
      },
      {
        "input": "num = 14",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= num <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPerfectSquare(num) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPerfectSquare(num): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_perfect_square(num):\n    pass\n"
    }
  },
  {
    "id": 1119,
    "slug": "arranging-coins",
    "title": "Arranging Coins",
    "difficulty": "Easy",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 58.2,
    "totalSubmissions": 146800,
    "description": [
      "You build a staircase where row `i` needs exactly `i` coins. Given `n` coins, return the number of **complete** rows you can build.",
      "Canonical must-do (AM-600 Binary Search / Math family)."
    ],
    "examples": [
      {
        "input": "n = 5",
        "output": "2",
        "explanation": "Rows of 1 and 2 use 3 coins; a third row needs 3 more."
      },
      {
        "input": "n = 8",
        "output": "3"
      }
    ],
    "constraints": [
      "0 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction arrangeCoins(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction arrangeCoins(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef arrange_coins(n):\n    pass\n"
    }
  },
  {
    "id": 1120,
    "slug": "find-smallest-letter-greater-than-target",
    "title": "Find Smallest Letter Greater Than Target",
    "difficulty": "Easy",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 77.9,
    "totalSubmissions": 181000,
    "description": [
      "Given a sorted array of `letters` and a `target` character, return the **smallest letter strictly greater than** target. Letters wrap around, so if none is greater, return the first letter.",
      "Canonical must-do (AM-600 Binary Search family)."
    ],
    "examples": [
      {
        "input": "letters = [\"c\",\"f\",\"j\"], target = \"a\"",
        "output": "\"c\""
      },
      {
        "input": "letters = [\"c\",\"f\",\"j\"], target = \"j\"",
        "output": "\"c\"",
        "explanation": "Wraps around."
      }
    ],
    "constraints": [
      "2 <= letters.length <= 10^4",
      "letters is sorted non-decreasing"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextGreatestLetter(letters, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nextGreatestLetter(letters, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef next_greatest_letter(letters, target):\n    pass\n"
    }
  },
  {
    "id": 1121,
    "slug": "peak-index-in-a-mountain-array",
    "title": "Peak Index in a Mountain Array",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 54.3,
    "totalSubmissions": 55100,
    "description": [
      "A **mountain array** strictly increases to a single peak, then strictly decreases. Given such an `arr`, return the index of the peak in O(log n).",
      "Canonical must-do (AM-600 Binary Search family)."
    ],
    "examples": [
      {
        "input": "arr = [0,1,0]",
        "output": "1"
      },
      {
        "input": "arr = [0,10,5,2]",
        "output": "1"
      }
    ],
    "constraints": [
      "3 <= arr.length <= 10^5",
      "arr is a valid mountain array"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction peakIndexInMountainArray(arr) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction peakIndexInMountainArray(arr): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef peak_index_in_mountain_array(arr):\n    pass\n"
    }
  },
  {
    "id": 1122,
    "slug": "find-k-closest-elements",
    "title": "Find K Closest Elements",
    "difficulty": "Medium",
    "tags": [
      "Binary Search"
    ],
    "acceptanceRate": 53.2,
    "totalSubmissions": 152300,
    "description": [
      "Given a **sorted** array `arr`, an integer `k`, and a value `x`, return the `k` closest values to `x`, sorted ascending. Ties prefer the **smaller** value.",
      "Canonical must-do (AM-600 Binary Search family)."
    ],
    "examples": [
      {
        "input": "arr = [1,2,3,4,5], k = 4, x = 3",
        "output": "[1,2,3,4]"
      },
      {
        "input": "arr = [1,2,3,4,5], k = 4, x = -1",
        "output": "[1,2,3,4]"
      }
    ],
    "constraints": [
      "1 <= k <= arr.length <= 10^4",
      "arr is sorted ascending"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findClosestElements(arr, k, x) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findClosestElements(arr, k, x): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_closest_elements(arr, k, x):\n    pass\n"
    }
  },
  {
    "id": 1123,
    "slug": "reverse-linked-list",
    "title": "Reverse Linked List",
    "difficulty": "Easy",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 59.9,
    "totalSubmissions": 179300,
    "description": [
      "Given the `head` of a singly linked list, reverse it and return the new head.",
      "The input array is built into a `ListNode` chain (`.val`, `.next`); return the head and it's serialized back to an array."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[5,4,3,2,1]"
      },
      {
        "input": "head = []",
        "output": "[]"
      }
    ],
    "constraints": [
      "0 <= nodes <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseList(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseList(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse_list(head):\n    pass\n"
    }
  },
  {
    "id": 1124,
    "slug": "middle-of-the-linked-list",
    "title": "Middle of the Linked List",
    "difficulty": "Easy",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 76.7,
    "totalSubmissions": 119900,
    "description": [
      "Given the `head` of a singly linked list, return the middle node. If there are two middle nodes, return the second one. (Return the node; it serializes from there to the end.)"
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[3,4,5]"
      },
      {
        "input": "head = [1,2,3,4,5,6]",
        "output": "[4,5,6]"
      }
    ],
    "constraints": [
      "1 <= nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction middleNode(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction middleNode(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef middle_node(head):\n    pass\n"
    }
  },
  {
    "id": 1125,
    "slug": "remove-nth-node-from-end",
    "title": "Remove Nth Node From End of List",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 38.9,
    "totalSubmissions": 199300,
    "description": [
      "Given the `head` of a list and an integer `n`, remove the n-th node from the end and return the head."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5], n = 2",
        "output": "[1,2,3,5]"
      },
      {
        "input": "head = [1], n = 1",
        "output": "[]"
      }
    ],
    "constraints": [
      "1 <= n <= list length <= 30"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeNthFromEnd(head, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeNthFromEnd(head, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_nth_from_end(head, n):\n    pass\n"
    }
  },
  {
    "id": 1126,
    "slug": "reorder-list",
    "title": "Reorder List",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 33.7,
    "totalSubmissions": 197500,
    "description": [
      "Given the `head` of a list, reorder it to L0 → Ln → L1 → Ln−1 → L2 → Ln−2 → … in place (don't change values, only pointers). Return the head."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4]",
        "output": "[1,4,2,3]"
      },
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[1,5,2,4,3]"
      }
    ],
    "constraints": [
      "1 <= nodes <= 5 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reorderList(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reorderList(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reorder_list(head):\n    pass\n"
    }
  },
  {
    "id": 1127,
    "slug": "palindrome-linked-list",
    "title": "Palindrome Linked List",
    "difficulty": "Easy",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 76.4,
    "totalSubmissions": 286900,
    "description": [
      "Given the `head` of a singly linked list, return `true` if the sequence of values is a palindrome."
    ],
    "examples": [
      {
        "input": "head = [1,2,2,1]",
        "output": "true"
      },
      {
        "input": "head = [1,2]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= nodes <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPalindrome(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPalindrome(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_palindrome(head):\n    pass\n"
    }
  },
  {
    "id": 1128,
    "slug": "remove-duplicates-from-sorted-list",
    "title": "Remove Duplicates from Sorted List",
    "difficulty": "Easy",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 48.2,
    "totalSubmissions": 247300,
    "description": [
      "Given the head of a SORTED linked list, delete duplicates so each value appears once, and return the list.",
      "Inputs are arrays; the harness builds the `ListNode` chain (`.val`, `.next`) and serializes your returned list back."
    ],
    "examples": [
      {
        "input": "head = [1,1,2]",
        "output": "[1,2]"
      },
      {
        "input": "head = [1,1,2,3,3]",
        "output": "[1,2,3]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 300",
      "Sorted ascending"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction deleteDuplicates(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction deleteDuplicates(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef delete_duplicates(head):\n    pass\n"
    }
  },
  {
    "id": 1129,
    "slug": "swap-nodes-in-pairs",
    "title": "Swap Nodes in Pairs",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 35.9,
    "totalSubmissions": 37900,
    "description": [
      "Swap every two adjacent nodes of the list and return its head. You must swap the NODES (rewire pointers), not just the values."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4]",
        "output": "[2,1,4,3]"
      },
      {
        "input": "head = [1,2,3]",
        "output": "[2,1,3]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction swapPairs(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction swapPairs(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef swap_pairs(head):\n    pass\n"
    }
  },
  {
    "id": 1130,
    "slug": "partition-list",
    "title": "Partition List",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 40.5,
    "totalSubmissions": 108500,
    "description": [
      "Partition the list around value `x`: all nodes with value < x come before all nodes ≥ x, PRESERVING the original relative order within each side. Return the head."
    ],
    "examples": [
      {
        "input": "head = [1,4,3,2,5,2], x = 3",
        "output": "[1,2,2,4,3,5]"
      },
      {
        "input": "head = [2,1], x = 2",
        "output": "[1,2]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 200",
      "-100 <= x <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction partition(head, x) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction partition(head, x): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef partition(head, x):\n    pass\n"
    }
  },
  {
    "id": 1131,
    "slug": "add-two-numbers",
    "title": "Add Two Numbers",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 58.9,
    "totalSubmissions": 246800,
    "description": [
      "Each list stores a non-negative integer in REVERSE order, one digit per node. Add the two numbers and return the sum as a list in the same format."
    ],
    "examples": [
      {
        "input": "l1 = [2,4,3], l2 = [5,6,4]",
        "output": "[7,0,8]",
        "explanation": "342 + 465 = 807."
      },
      {
        "input": "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
        "output": "[8,9,9,9,0,0,0,1]"
      }
    ],
    "constraints": [
      "1 <= list lengths <= 100",
      "No leading zeros except the number 0"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction addTwoNumbers(l1, l2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction addTwoNumbers(l1, l2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef add_two_numbers(l1, l2):\n    pass\n"
    }
  },
  {
    "id": 1132,
    "slug": "remove-linked-list-elements",
    "title": "Remove Linked List Elements",
    "difficulty": "Easy",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 49.1,
    "totalSubmissions": 206800,
    "description": [
      "Given the `head` of a linked list and a value `val`, remove all nodes whose value equals `val` and return the new head.",
      "Canonical must-do (AM-600 Linked List family)."
    ],
    "examples": [
      {
        "input": "head = [1,2,6,3,4,5,6], val = 6",
        "output": "[1,2,3,4,5]"
      },
      {
        "input": "head = [7,7,7,7], val = 7",
        "output": "[]"
      }
    ],
    "constraints": [
      "0 <= list length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeElements(head, val) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeElements(head, val): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_elements(head, val):\n    pass\n"
    }
  },
  {
    "id": 1133,
    "slug": "odd-even-linked-list",
    "title": "Odd Even Linked List",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 38.5,
    "totalSubmissions": 93500,
    "description": [
      "Group all nodes at **odd positions** (1st, 3rd, 5th…) together, followed by the nodes at **even positions**, preserving relative order within each group. Return the reordered list. Do it in O(1) extra space.",
      "Canonical must-do (AM-600 Linked List family)."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[1,3,5,2,4]"
      },
      {
        "input": "head = [2,1,3,5,6,4,7]",
        "output": "[2,3,6,7,1,5,4]"
      }
    ],
    "constraints": [
      "0 <= list length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction oddEvenList(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction oddEvenList(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef odd_even_list(head):\n    pass\n"
    }
  },
  {
    "id": 1134,
    "slug": "reverse-linked-list-ii",
    "title": "Reverse Linked List II",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 52.2,
    "totalSubmissions": 169400,
    "description": [
      "Given the `head` of a list and 1-indexed positions `left <= right`, reverse the nodes from position `left` to `right` and return the list.",
      "Canonical must-do (AM-600 Linked List family)."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5], left = 2, right = 4",
        "output": "[1,4,3,2,5]"
      },
      {
        "input": "head = [5], left = 1, right = 1",
        "output": "[5]"
      }
    ],
    "constraints": [
      "1 <= left <= right <= list length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseBetween(head, left, right) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseBetween(head, left, right): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse_between(head, left, right):\n    pass\n"
    }
  },
  {
    "id": 1135,
    "slug": "rotate-list",
    "title": "Rotate List",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 33.8,
    "totalSubmissions": 46100,
    "description": [
      "Given the `head` of a linked list, rotate it to the **right** by `k` places and return the new head. `k` may exceed the list length.",
      "Canonical must-do (AM-600 Linked List family)."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5], k = 2",
        "output": "[4,5,1,2,3]"
      },
      {
        "input": "head = [0,1,2], k = 4",
        "output": "[2,0,1]"
      }
    ],
    "constraints": [
      "0 <= list length <= 500",
      "0 <= k <= 2·10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rotateRight(head, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rotateRight(head, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef rotate_right(head, k):\n    pass\n"
    }
  },
  {
    "id": 1136,
    "slug": "merge-nodes-in-between-zeros",
    "title": "Merge Nodes in Between Zeros",
    "difficulty": "Medium",
    "tags": [
      "Linked List"
    ],
    "acceptanceRate": 41.1,
    "totalSubmissions": 77000,
    "description": [
      "A linked list starts and ends with `0`, with `0`s separating groups of non-zero values. Replace each group with a single node holding that group's **sum**, and remove all the zeros. Return the resulting list.",
      "Canonical must-do (AM-600 Linked List family)."
    ],
    "examples": [
      {
        "input": "head = [0,3,1,0,4,5,2,0]",
        "output": "[4,11]",
        "explanation": "3+1 = 4, 4+5+2 = 11."
      },
      {
        "input": "head = [0,1,0,3,0,2,2,0]",
        "output": "[1,3,4]"
      }
    ],
    "constraints": [
      "3 <= list length <= 2000",
      "First and last values are 0"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mergeNodes(head) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mergeNodes(head): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef merge_nodes(head):\n    pass\n"
    }
  },
  {
    "id": 1137,
    "slug": "maximum-depth-of-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 48.8,
    "totalSubmissions": 203100,
    "description": [
      "Given the `root` of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to a leaf.",
      "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode` with `.val`, `.left`, `.right`."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "3"
      },
      {
        "input": "root = [1,null,2]",
        "output": "2"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxDepth(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxDepth(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_depth(root):\n    pass\n"
    }
  },
  {
    "id": 1138,
    "slug": "same-tree",
    "title": "Same Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 51.4,
    "totalSubmissions": 85000,
    "description": [
      "Given the roots `p` and `q` of two binary trees, return `true` if they are identical in structure and node values."
    ],
    "examples": [
      {
        "input": "p = [1,2,3], q = [1,2,3]",
        "output": "true"
      },
      {
        "input": "p = [1,2], q = [1,null,2]",
        "output": "false"
      }
    ],
    "constraints": [
      "0 <= nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSameTree(p, q) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSameTree(p, q): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_same_tree(p, q):\n    pass\n"
    }
  },
  {
    "id": 1139,
    "slug": "invert-binary-tree",
    "title": "Invert Binary Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 52.9,
    "totalSubmissions": 279500,
    "description": [
      "Given the `root` of a binary tree, invert it (swap every node's left and right subtrees) and return the root.",
      "Return the tree; the harness serializes it back to a level-order array."
    ],
    "examples": [
      {
        "input": "root = [4,2,7,1,3,6,9]",
        "output": "[4,7,2,9,6,3,1]"
      },
      {
        "input": "root = [2,1,3]",
        "output": "[2,3,1]"
      }
    ],
    "constraints": [
      "0 <= nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction invertTree(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction invertTree(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef invert_tree(root):\n    pass\n"
    }
  },
  {
    "id": 1140,
    "slug": "balanced-binary-tree",
    "title": "Balanced Binary Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 74.7,
    "totalSubmissions": 143700,
    "description": [
      "Given the `root` of a binary tree, return `true` if it is height-balanced: for every node, the heights of its left and right subtrees differ by at most 1."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "true"
      },
      {
        "input": "root = [1,2,2,3,3,null,null,4,4]",
        "output": "false"
      }
    ],
    "constraints": [
      "0 <= nodes <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isBalanced(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isBalanced(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_balanced(root):\n    pass\n"
    }
  },
  {
    "id": 1141,
    "slug": "diameter-of-binary-tree",
    "title": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 61.4,
    "totalSubmissions": 162700,
    "description": [
      "Given the `root` of a binary tree, return its diameter — the number of edges on the longest path between any two nodes. The path need not pass through the root."
    ],
    "examples": [
      {
        "input": "root = [1,2,3,4,5]",
        "output": "3",
        "explanation": "Path 4→2→1→3 or 5→2→1→3."
      },
      {
        "input": "root = [1,2]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= nodes <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction diameterOfBinaryTree(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction diameterOfBinaryTree(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef diameter_of_binary_tree(root):\n    pass\n"
    }
  },
  {
    "id": 1142,
    "slug": "binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 55.2,
    "totalSubmissions": 79600,
    "description": [
      "Given the `root` of a binary tree, return its level-order traversal: a list of levels, each a list of node values left to right."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "[[3],[9,20],[15,7]]"
      },
      {
        "input": "root = []",
        "output": "[]"
      }
    ],
    "constraints": [
      "0 <= nodes <= 2000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction levelOrder(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction levelOrder(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef level_order(root):\n    pass\n"
    }
  },
  {
    "id": 1143,
    "slug": "validate-binary-search-tree",
    "title": "Validate Binary Search Tree",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 35.9,
    "totalSubmissions": 47000,
    "description": [
      "Given the `root` of a binary tree, return `true` if it is a valid binary search tree: every node's left subtree holds only smaller values, its right subtree only larger, and both subtrees are themselves BSTs."
    ],
    "examples": [
      {
        "input": "root = [2,1,3]",
        "output": "true"
      },
      {
        "input": "root = [5,1,4,null,null,3,6]",
        "output": "false",
        "explanation": "4's subtree contains 3, which is < 5."
      }
    ],
    "constraints": [
      "1 <= nodes <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isValidBST(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isValidBST(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_valid_b_s_t(root):\n    pass\n"
    }
  },
  {
    "id": 1144,
    "slug": "lowest-common-ancestor-of-a-bst",
    "title": "Lowest Common Ancestor of a BST",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 49.4,
    "totalSubmissions": 162800,
    "description": [
      "Given the `root` of a binary SEARCH tree and two values `p` and `q` present in it, return the value of their lowest common ancestor (the deepest node having both in its subtrees; a node can be an ancestor of itself).",
      "Here `p` and `q` are passed as plain values, and you return the LCA node's value."
    ],
    "examples": [
      {
        "input": "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8",
        "output": "6"
      },
      {
        "input": "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4",
        "output": "2"
      }
    ],
    "constraints": [
      "2 <= nodes <= 10^5",
      "p and q exist in the tree"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lowestCommonAncestor(root, p, q) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lowestCommonAncestor(root, p, q): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef lowest_common_ancestor(root, p, q):\n    pass\n"
    }
  },
  {
    "id": 1145,
    "slug": "binary-tree-right-side-view",
    "title": "Binary Tree Right Side View",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 61.9,
    "totalSubmissions": 72400,
    "description": [
      "Standing to the right of the tree, return the values you can see, top to bottom (the last node of each level).",
      "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`."
    ],
    "examples": [
      {
        "input": "root = [1,2,3,null,5,null,4]",
        "output": "[1,3,4]"
      },
      {
        "input": "root = [1,null,3]",
        "output": "[1,3]"
      },
      {
        "input": "root = []",
        "output": "[]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rightSideView(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rightSideView(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef right_side_view(root):\n    pass\n"
    }
  },
  {
    "id": 1146,
    "slug": "kth-smallest-element-in-a-bst",
    "title": "Kth Smallest Element in a BST",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 58.1,
    "totalSubmissions": 68000,
    "description": [
      "Return the kth smallest value (1-indexed) in a binary search tree.",
      "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`."
    ],
    "examples": [
      {
        "input": "root = [3,1,4,null,2], k = 1",
        "output": "1"
      },
      {
        "input": "root = [5,3,6,2,4,null,null,1], k = 3",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= k <= number of nodes <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kthSmallest(root, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kthSmallest(root, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef kth_smallest(root, k):\n    pass\n"
    }
  },
  {
    "id": 1147,
    "slug": "convert-sorted-array-to-bst",
    "title": "Convert Sorted Array to BST (minimal height)",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 46.7,
    "totalSubmissions": 236400,
    "description": [
      "Given a **sorted** (ascending) array of unique integers `nums`, build a **height-balanced** binary search tree and return its root. For a deterministic answer, always pick the **left-middle** element `(lo + hi) >> 1` as the subtree root.",
      "From *interactive-coding-challenges* (Graphs & Trees: BST with minimal height from a sorted array)."
    ],
    "examples": [
      {
        "input": "nums = [-10,-3,0,5,9]",
        "output": "[0,-10,5,null,-3,null,9]",
        "explanation": "0 is the middle; recurse on each half."
      },
      {
        "input": "nums = [1,3]",
        "output": "[1,null,3]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "nums is sorted, strictly increasing"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortedArrayToBST(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sortedArrayToBST(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sorted_array_to_b_s_t(nums):\n    pass\n"
    }
  },
  {
    "id": 1148,
    "slug": "inorder-successor-bst",
    "title": "Inorder Successor in a BST",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 60.1,
    "totalSubmissions": 228200,
    "description": [
      "Given the `root` of a binary search tree and a value `p` present in it, return the value of `p`'s **in-order successor** (the smallest value strictly greater than `p`), or `null` if `p` is the largest value.",
      "From *interactive-coding-challenges* (Graphs & Trees: in-order successor in a BST)."
    ],
    "examples": [
      {
        "input": "root = [5,3,6,2,4], p = 3",
        "output": "4"
      },
      {
        "input": "root = [5,3,6,2,4], p = 6",
        "output": "null",
        "explanation": "6 is the largest value."
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 10^4",
      "All node values are unique; p exists in the tree"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction inorderSuccessor(root, p) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction inorderSuccessor(root, p): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef inorder_successor(root, p):\n    pass\n"
    }
  },
  {
    "id": 1149,
    "slug": "symmetric-tree",
    "title": "Symmetric Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 65.9,
    "totalSubmissions": 107700,
    "description": [
      "Given the `root` of a binary tree, return `true` if it is a **mirror of itself** (symmetric around its center).",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [1,2,2,3,4,4,3]",
        "output": "true"
      },
      {
        "input": "root = [1,2,2,null,3,null,3]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSymmetric(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSymmetric(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_symmetric(root):\n    pass\n"
    }
  },
  {
    "id": 1150,
    "slug": "path-sum-ii",
    "title": "Path Sum II",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 42.5,
    "totalSubmissions": 96300,
    "description": [
      "Given the `root` of a binary tree and a `targetSum`, return **all root-to-leaf paths** where the sum of the node values equals `targetSum`. Each path is the list of node values; any order of paths is accepted.",
      "Canonical must-do (AM-600 Trees / Backtracking family)."
    ],
    "examples": [
      {
        "input": "root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22",
        "output": "[[5,4,11,2],[5,8,4,5]]"
      },
      {
        "input": "root = [1,2,3], targetSum = 5",
        "output": "[]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pathSum(root, targetSum) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pathSum(root, targetSum): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef path_sum(root, targetSum):\n    pass\n"
    }
  },
  {
    "id": 1151,
    "slug": "count-complete-tree-nodes",
    "title": "Count Complete Tree Nodes",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 47.1,
    "totalSubmissions": 59800,
    "description": [
      "Given the `root` of a **complete** binary tree (every level full except possibly the last, which is filled left-to-right), return the number of nodes.",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [1,2,3,4,5,6]",
        "output": "6"
      },
      {
        "input": "root = []",
        "output": "0"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 5·10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countNodes(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countNodes(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef count_nodes(root):\n    pass\n"
    }
  },
  {
    "id": 1152,
    "slug": "sum-of-left-leaves",
    "title": "Sum of Left Leaves",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 78.1,
    "totalSubmissions": 283200,
    "description": [
      "Given the `root` of a binary tree, return the sum of all **left leaves** — leaf nodes that are the left child of their parent.",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "24",
        "explanation": "Left leaves 9 and 15."
      },
      {
        "input": "root = [1]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sumOfLeftLeaves(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sumOfLeftLeaves(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sum_of_left_leaves(root):\n    pass\n"
    }
  },
  {
    "id": 1153,
    "slug": "subtree-of-another-tree",
    "title": "Subtree of Another Tree",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 70.6,
    "totalSubmissions": 114100,
    "description": [
      "Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the **same structure and values** as `subRoot`.",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [3,4,5,1,2], subRoot = [4,1,2]",
        "output": "true"
      },
      {
        "input": "root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= nodes in root <= 2000",
      "1 <= nodes in subRoot <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSubtree(root, subRoot) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isSubtree(root, subRoot): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_subtree(root, subRoot):\n    pass\n"
    }
  },
  {
    "id": 1154,
    "slug": "binary-tree-inorder-traversal",
    "title": "Binary Tree Inorder Traversal",
    "difficulty": "Easy",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 69.1,
    "totalSubmissions": 257400,
    "description": [
      "Given the `root` of a binary tree, return its **inorder** traversal (left subtree, node, right subtree) as an array. Try it iteratively with an explicit stack.",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [1,null,2,3]",
        "output": "[1,3,2]"
      },
      {
        "input": "root = [1,2,3,4,5]",
        "output": "[4,2,5,1,3]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction inorderTraversal(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction inorderTraversal(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef inorder_traversal(root):\n    pass\n"
    }
  },
  {
    "id": 1155,
    "slug": "binary-tree-maximum-path-sum",
    "title": "Binary Tree Maximum Path Sum",
    "difficulty": "Hard",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 43.7,
    "totalSubmissions": 169400,
    "description": [
      "A **path** is any sequence of connected nodes (it need not pass through the root). Given the `root` of a binary tree, return the maximum sum of the values along any non-empty path.",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [1,2,3]",
        "output": "6",
        "explanation": "2 → 1 → 3."
      },
      {
        "input": "root = [-10,9,20,null,null,15,7]",
        "output": "42",
        "explanation": "15 → 20 → 7."
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 3·10^4",
      "-1000 <= values <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxPathSum(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxPathSum(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_path_sum(root):\n    pass\n"
    }
  },
  {
    "id": 1156,
    "slug": "lowest-common-ancestor-binary-tree",
    "title": "Lowest Common Ancestor of a Binary Tree",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 43.2,
    "totalSubmissions": 76600,
    "description": [
      "Given the `root` of a binary tree (NOT a BST) and two values `p` and `q` present in it, return the value of their **lowest common ancestor** — the deepest node having both as descendants (a node may be a descendant of itself).",
      "Canonical must-do (AM-600 Trees family). Harder than the BST version: there's no ordering to guide you."
    ],
    "examples": [
      {
        "input": "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1",
        "output": "3"
      },
      {
        "input": "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4",
        "output": "5",
        "explanation": "5 is an ancestor of 4."
      }
    ],
    "constraints": [
      "2 <= number of nodes <= 10^5",
      "All values unique; p and q exist"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lowestCommonAncestor(root, p, q) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lowestCommonAncestor(root, p, q): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef lowest_common_ancestor(root, p, q):\n    pass\n"
    }
  },
  {
    "id": 1157,
    "slug": "sum-root-to-leaf-numbers",
    "title": "Sum Root to Leaf Numbers",
    "difficulty": "Medium",
    "tags": [
      "Trees"
    ],
    "acceptanceRate": 35.7,
    "totalSubmissions": 60300,
    "description": [
      "Each root-to-leaf path in a binary tree of digits (0–9) spells a number (e.g. `1 → 2 → 3` is `123`). Return the **total sum** of all root-to-leaf numbers.",
      "Canonical must-do (AM-600 Trees family)."
    ],
    "examples": [
      {
        "input": "root = [1,2,3]",
        "output": "25",
        "explanation": "12 + 13."
      },
      {
        "input": "root = [4,9,0,5,1]",
        "output": "1026",
        "explanation": "495 + 491 + 40."
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 1000",
      "0 <= node value <= 9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sumNumbers(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction sumNumbers(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef sum_numbers(root):\n    pass\n"
    }
  },
  {
    "id": 1158,
    "slug": "flood-fill",
    "title": "Flood Fill",
    "difficulty": "Easy",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 58.3,
    "totalSubmissions": 160800,
    "description": [
      "Given an image as a grid of colors, a start pixel `(sr, sc)`, and a new `color`, recolor the start pixel and every pixel 4-directionally connected to it that shares its ORIGINAL color. Return the image."
    ],
    "examples": [
      {
        "input": "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2",
        "output": "[[2,2,2],[2,2,0],[2,0,1]]",
        "explanation": "The bottom-right 1 is not connected to the start."
      },
      {
        "input": "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0",
        "output": "[[0,0,0],[0,0,0]]"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 50"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction floodFill(image, sr, sc, color) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction floodFill(image, sr, sc, color): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef flood_fill(image, sr, sc, color):\n    pass\n"
    }
  },
  {
    "id": 1159,
    "slug": "island-perimeter",
    "title": "Island Perimeter",
    "difficulty": "Easy",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 74.7,
    "totalSubmissions": 96500,
    "description": [
      "A grid has exactly one island (1 = land, 0 = water, no lakes). Each cell is a 1×1 square. Return the island's perimeter."
    ],
    "examples": [
      {
        "input": "grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]",
        "output": "16"
      },
      {
        "input": "grid = [[1]]",
        "output": "4"
      },
      {
        "input": "grid = [[1,0]]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction islandPerimeter(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction islandPerimeter(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef island_perimeter(grid):\n    pass\n"
    }
  },
  {
    "id": 1160,
    "slug": "find-if-path-exists-in-graph",
    "title": "Find if Path Exists in Graph",
    "difficulty": "Easy",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 48.5,
    "totalSubmissions": 64900,
    "description": [
      "You are given `n` vertices (0 to n−1) and an undirected edge list `edges`. Return `true` if there is any path from `source` to `destination`."
    ],
    "examples": [
      {
        "input": "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2",
        "output": "true"
      },
      {
        "input": "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= n <= 2 * 10^5",
      "0 <= edges.length <= 2 * 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validPath(n, edges, source, destination) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validPath(n, edges, source, destination): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef valid_path(n, edges, source, destination):\n    pass\n"
    }
  },
  {
    "id": 1161,
    "slug": "keys-and-rooms",
    "title": "Keys and Rooms",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 55.3,
    "totalSubmissions": 127100,
    "description": [
      "There are `n` rooms; `rooms[i]` lists the keys lying in room `i`. You start in room 0 (unlocked). You may only enter a room whose key you have collected. Return `true` if you can visit every room."
    ],
    "examples": [
      {
        "input": "rooms = [[1],[2],[3],[]]",
        "output": "true",
        "explanation": "0 → 1 → 2 → 3."
      },
      {
        "input": "rooms = [[1,3],[3,0,1],[2],[0]]",
        "output": "false",
        "explanation": "Room 2 is never reachable."
      }
    ],
    "constraints": [
      "2 <= rooms.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canVisitAllRooms(rooms) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canVisitAllRooms(rooms): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_visit_all_rooms(rooms):\n    pass\n"
    }
  },
  {
    "id": 1162,
    "slug": "path-sum",
    "title": "Path Sum",
    "difficulty": "Easy",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 65.6,
    "totalSubmissions": 126400,
    "description": [
      "Given the root of a binary tree and `targetSum`, return `true` if some ROOT-TO-LEAF path sums to `targetSum`.",
      "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode` with `.val`, `.left`, `.right`."
    ],
    "examples": [
      {
        "input": "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22",
        "output": "true",
        "explanation": "5 → 4 → 11 → 2."
      },
      {
        "input": "root = [1,2,3], targetSum = 5",
        "output": "false"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hasPathSum(root, targetSum) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hasPathSum(root, targetSum): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef has_path_sum(root, targetSum):\n    pass\n"
    }
  },
  {
    "id": 1163,
    "slug": "count-good-nodes-in-binary-tree",
    "title": "Count Good Nodes in Binary Tree",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 53.8,
    "totalSubmissions": 187700,
    "description": [
      "A node is GOOD if no node on the path from the root to it has a greater value. Return the number of good nodes.",
      "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`."
    ],
    "examples": [
      {
        "input": "root = [3,1,4,3,null,1,5]",
        "output": "4",
        "explanation": "Root 3, the 4, the 5, and the leaf 3."
      },
      {
        "input": "root = [3,3,null,4,2]",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction goodNodes(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction goodNodes(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef good_nodes(root):\n    pass\n"
    }
  },
  {
    "id": 1164,
    "slug": "employee-importance",
    "title": "Employee Importance",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 33.1,
    "totalSubmissions": 154000,
    "description": [
      "Each employee is `[id, importance, subordinateIds]`. Given the list `employees` and an `id`, return that employee's TOTAL importance: their own plus (recursively) all their direct and indirect subordinates'."
    ],
    "examples": [
      {
        "input": "employees = [[1,5,[2,3]],[2,3,[]],[3,3,[]]], id = 1",
        "output": "11",
        "explanation": "5 + 3 + 3."
      },
      {
        "input": "employees = [[1,2,[5]],[5,-3,[]]], id = 5",
        "output": "-3"
      }
    ],
    "constraints": [
      "1 <= employees.length <= 2000",
      "One employee per id; the hierarchy is a tree"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getImportance(employees, id) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getImportance(employees, id): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef get_importance(employees, id):\n    pass\n"
    }
  },
  {
    "id": 1165,
    "slug": "surrounded-regions",
    "title": "Surrounded Regions",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 55,
    "totalSubmissions": 258200,
    "description": [
      "Given a board of `\"X\"` and `\"O\"`, flip every `\"O\"` region that is FULLY surrounded by `\"X\"` into `\"X\"`. A region touching the border is not surrounded. Return the board."
    ],
    "examples": [
      {
        "input": "board = [[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
        "output": "[[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
        "explanation": "The interior O-region is captured; the O on the bottom row touches the border, so it survives."
      },
      {
        "input": "board = [[\"O\"]]",
        "output": "[[\"O\"]]"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction solve(board) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction solve(board): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef solve(board):\n    pass\n"
    }
  },
  {
    "id": 1166,
    "slug": "all-paths-from-source-to-target",
    "title": "All Paths From Source to Target",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 55.7,
    "totalSubmissions": 38400,
    "description": [
      "Given a directed acyclic graph where `graph[i]` lists the nodes reachable from `i`, return ALL paths from node `0` to node `n − 1`, in any order."
    ],
    "examples": [
      {
        "input": "graph = [[1,2],[3],[3],[]]",
        "output": "[[0,1,3],[0,2,3]]"
      },
      {
        "input": "graph = [[1],[]]",
        "output": "[[0,1]]"
      }
    ],
    "constraints": [
      "2 <= n <= 15",
      "The graph is a DAG (no cycles)"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction allPathsSourceTarget(graph) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction allPathsSourceTarget(graph): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef all_paths_source_target(graph):\n    pass\n"
    }
  },
  {
    "id": 1167,
    "slug": "count-sub-islands",
    "title": "Count Sub Islands",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 43.4,
    "totalSubmissions": 145300,
    "description": [
      "Given two grids of the same size, an island in `grid2` is a SUB-ISLAND if every one of its cells is also land (`1`) in `grid1`. Return the number of sub-islands."
    ],
    "examples": [
      {
        "input": "grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]], grid2 = [[1,1,1,0,0],[0,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0],[0,1,0,1,0]]",
        "output": "3"
      },
      {
        "input": "grid1 = [[1,1],[1,1]], grid2 = [[1,1],[1,1]]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countSubIslands(grid1, grid2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countSubIslands(grid1, grid2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef count_sub_islands(grid1, grid2):\n    pass\n"
    }
  },
  {
    "id": 1168,
    "slug": "binary-tree-paths",
    "title": "Binary Tree Paths",
    "difficulty": "Easy",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 71.1,
    "totalSubmissions": 204700,
    "description": [
      "Given the `root` of a binary tree, return all root-to-leaf paths as strings in the form `\"1->2->5\"`, in any order.",
      "Canonical must-do (AM-600 Trees / DFS family)."
    ],
    "examples": [
      {
        "input": "root = [1,2,3,null,5]",
        "output": "[\"1->2->5\",\"1->3\"]"
      },
      {
        "input": "root = [1]",
        "output": "[\"1\"]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction binaryTreePaths(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction binaryTreePaths(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef binary_tree_paths(root):\n    pass\n"
    }
  },
  {
    "id": 1169,
    "slug": "path-sum-iii",
    "title": "Path Sum III",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 58,
    "totalSubmissions": 239500,
    "description": [
      "Given the `root` of a binary tree and a `targetSum`, return the **number of paths** that sum to the target. Paths must go downward (parent → child) but need not start at the root or end at a leaf.",
      "Canonical must-do (AM-600 Trees / DFS family)."
    ],
    "examples": [
      {
        "input": "root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8",
        "output": "3"
      },
      {
        "input": "root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22",
        "output": "3"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 1000",
      "-10^9 <= values <= 10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pathSumIII(root, targetSum) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pathSumIII(root, targetSum): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef path_sum_i_i_i(root, targetSum):\n    pass\n"
    }
  },
  {
    "id": 1170,
    "slug": "number-of-enclaves",
    "title": "Number of Enclaves",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search"
    ],
    "acceptanceRate": 46.5,
    "totalSubmissions": 116400,
    "description": [
      "Given a binary `grid` where `1` is land and `0` is sea, you may walk between adjacent land cells or off the grid's border. Return the number of land cells from which you **cannot** walk off the border.",
      "Canonical must-do (AM-600 DFS family)."
    ],
    "examples": [
      {
        "input": "grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]",
        "output": "3"
      },
      {
        "input": "grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numEnclaves(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numEnclaves(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_enclaves(grid):\n    pass\n"
    }
  },
  {
    "id": 1171,
    "slug": "minimum-depth-of-binary-tree",
    "title": "Minimum Depth of Binary Tree",
    "difficulty": "Easy",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 57.6,
    "totalSubmissions": 111600,
    "description": [
      "Return the minimum depth of a binary tree: the number of nodes on the shortest path from the root to any LEAF.",
      "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "2"
      },
      {
        "input": "root = [2,null,3,null,4,null,5,null,6]",
        "output": "5",
        "explanation": "The tree is a right-leaning chain; the only leaf is at depth 5."
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minDepth(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minDepth(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_depth(root):\n    pass\n"
    }
  },
  {
    "id": 1172,
    "slug": "shortest-path-in-binary-matrix",
    "title": "Shortest Path in Binary Matrix",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 51.6,
    "totalSubmissions": 79000,
    "description": [
      "In an `n × n` grid of 0s (open) and 1s (blocked), a clear path runs from the top-left to the bottom-right cell moving in ANY of the 8 directions through 0-cells. Return the length of the shortest clear path (number of cells), or `-1`."
    ],
    "examples": [
      {
        "input": "grid = [[0,1],[1,0]]",
        "output": "2"
      },
      {
        "input": "grid = [[0,0,0],[1,1,0],[1,1,0]]",
        "output": "4"
      },
      {
        "input": "grid = [[1,0],[0,0]]",
        "output": "-1",
        "explanation": "The start cell is blocked."
      }
    ],
    "constraints": [
      "1 <= n <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction shortestPathBinaryMatrix(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction shortestPathBinaryMatrix(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef shortest_path_binary_matrix(grid):\n    pass\n"
    }
  },
  {
    "id": 1173,
    "slug": "01-matrix",
    "title": "01 Matrix",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 51,
    "totalSubmissions": 94700,
    "description": [
      "Given an `m × n` binary matrix, return a matrix where each cell holds the distance (4-directional steps) to the NEAREST 0."
    ],
    "examples": [
      {
        "input": "mat = [[0,0,0],[0,1,0],[0,0,0]]",
        "output": "[[0,0,0],[0,1,0],[0,0,0]]"
      },
      {
        "input": "mat = [[0,0,0],[0,1,0],[1,1,1]]",
        "output": "[[0,0,0],[0,1,0],[1,2,1]]"
      }
    ],
    "constraints": [
      "1 <= m, n <= 10^4",
      "1 <= m * n <= 10^4",
      "At least one 0 exists"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction updateMatrix(mat) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction updateMatrix(mat): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef update_matrix(mat):\n    pass\n"
    }
  },
  {
    "id": 1174,
    "slug": "walls-and-gates",
    "title": "Walls and Gates",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 36.1,
    "totalSubmissions": 70200,
    "description": [
      "You are given a grid where `-1` is a wall, `0` is a gate, and `2147483647` (INF) is an empty room. Fill every room with the distance to its nearest gate (leave INF if unreachable) and return the grid."
    ],
    "examples": [
      {
        "input": "rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]",
        "output": "[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]"
      },
      {
        "input": "rooms = [[-1]]",
        "output": "[[-1]]"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 250"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wallsAndGates(rooms) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wallsAndGates(rooms): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef walls_and_gates(rooms):\n    pass\n"
    }
  },
  {
    "id": 1175,
    "slug": "nearest-exit-from-maze",
    "title": "Nearest Exit From Entrance in Maze",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 55,
    "totalSubmissions": 205400,
    "description": [
      "In a maze of `\".\"` (open) and `\"+\"` (wall), starting at `entrance = [row, col]`, return the fewest steps to reach an EXIT: an open border cell other than the entrance. Return `-1` if impossible."
    ],
    "examples": [
      {
        "input": "maze = [[\"+\",\"+\",\".\",\"+\"],[\".\",\".\",\".\",\"+\"],[\"+\",\"+\",\"+\",\".\"]], entrance = [1,2]",
        "output": "1"
      },
      {
        "input": "maze = [[\"+\",\"+\",\"+\"],[\".\",\".\",\".\"],[\"+\",\"+\",\"+\"]], entrance = [1,0]",
        "output": "2"
      },
      {
        "input": "maze = [[\".\",\"+\"]], entrance = [0,0]",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 100",
      "entrance is an open cell"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nearestExit(maze, entrance) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nearestExit(maze, entrance): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef nearest_exit(maze, entrance):\n    pass\n"
    }
  },
  {
    "id": 1176,
    "slug": "jump-game-iii",
    "title": "Jump Game III",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 35.3,
    "totalSubmissions": 257800,
    "description": [
      "From index `i` you may jump to `i + arr[i]` or `i − arr[i]` (staying in bounds). Starting at `start`, return `true` if you can reach ANY index holding value 0."
    ],
    "examples": [
      {
        "input": "arr = [4,2,3,0,3,1,2], start = 5",
        "output": "true",
        "explanation": "5 → 4 → 1 → 3."
      },
      {
        "input": "arr = [3,0,2,1,2], start = 2",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= arr.length <= 5 * 10^4",
      "0 <= arr[i] < arr.length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canReach(arr, start) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canReach(arr, start): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_reach(arr, start):\n    pass\n"
    }
  },
  {
    "id": 1177,
    "slug": "open-the-lock",
    "title": "Open the Lock",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 40.8,
    "totalSubmissions": 98800,
    "description": [
      "A lock has 4 wheels, each showing 0–9 and turnable one step in either direction (9 wraps to 0). Starting from `\"0000\"`, return the minimum number of single-wheel turns to reach `target`, never landing on any code in `deadends`. Return `-1` if impossible."
    ],
    "examples": [
      {
        "input": "deadends = [\"0201\",\"0101\",\"0102\",\"1212\",\"2002\"], target = \"0202\"",
        "output": "6"
      },
      {
        "input": "deadends = [\"8888\"], target = \"0009\"",
        "output": "1"
      },
      {
        "input": "deadends = [\"0000\"], target = \"8888\"",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= deadends.length <= 500",
      "target is not \"0000\""
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction openLock(deadends, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction openLock(deadends, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef open_lock(deadends, target):\n    pass\n"
    }
  },
  {
    "id": 1178,
    "slug": "perfect-squares",
    "title": "Perfect Squares",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 38.7,
    "totalSubmissions": 222100,
    "description": [
      "Return the least number of perfect square numbers (1, 4, 9, 16, …) that sum to `n`."
    ],
    "examples": [
      {
        "input": "n = 12",
        "output": "3",
        "explanation": "12 = 4 + 4 + 4 (not 9+1+1+1)."
      },
      {
        "input": "n = 13",
        "output": "2",
        "explanation": "13 = 4 + 9."
      }
    ],
    "constraints": [
      "1 <= n <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numSquares(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numSquares(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_squares(n):\n    pass\n"
    }
  },
  {
    "id": 1179,
    "slug": "minimum-genetic-mutation",
    "title": "Minimum Genetic Mutation",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 50.9,
    "totalSubmissions": 181000,
    "description": [
      "A gene is an 8-character string over `A/C/G/T`. One mutation changes one character, and every intermediate (and final) gene must exist in `bank`. Return the minimum number of mutations from `startGene` to `endGene`, or `-1`."
    ],
    "examples": [
      {
        "input": "startGene = \"AACCGGTT\", endGene = \"AACCGGTA\", bank = [\"AACCGGTA\"]",
        "output": "1"
      },
      {
        "input": "startGene = \"AACCGGTT\", endGene = \"AAACGGTA\", bank = [\"AACCGGTA\",\"AACCGCTA\",\"AAACGGTA\"]",
        "output": "2"
      }
    ],
    "constraints": [
      "0 <= bank.length <= 10"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minMutation(startGene, endGene, bank) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minMutation(startGene, endGene, bank): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_mutation(startGene, endGene, bank):\n    pass\n"
    }
  },
  {
    "id": 1180,
    "slug": "word-ladder",
    "title": "Word Ladder",
    "difficulty": "Hard",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 40.9,
    "totalSubmissions": 102600,
    "description": [
      "Given `beginWord`, `endWord`, and a `wordList`, each step changes exactly one letter and must land on a word in the list. Return the NUMBER OF WORDS in the shortest chain from `beginWord` to `endWord` (inclusive), or `0` if none exists."
    ],
    "examples": [
      {
        "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
        "output": "5",
        "explanation": "hit → hot → dot → dog → cog."
      },
      {
        "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= wordList.length <= 5000",
      "All words have the same length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction ladderLength(beginWord, endWord, wordList) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction ladderLength(beginWord, endWord, wordList): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef ladder_length(beginWord, endWord, wordList):\n    pass\n"
    }
  },
  {
    "id": 1181,
    "slug": "average-of-levels-in-binary-tree",
    "title": "Average of Levels in Binary Tree",
    "difficulty": "Easy",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 78.2,
    "totalSubmissions": 284000,
    "description": [
      "Given the `root` of a binary tree, return an array of the **average value of the nodes on each level**, from the root level downward.",
      "Canonical must-do (AM-600 BFS family)."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "[3,14.5,11]"
      },
      {
        "input": "root = [1,2,3]",
        "output": "[1,2.5]"
      }
    ],
    "constraints": [
      "1 <= number of nodes <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction averageOfLevels(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction averageOfLevels(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef average_of_levels(root):\n    pass\n"
    }
  },
  {
    "id": 1182,
    "slug": "binary-tree-zigzag-level-order",
    "title": "Binary Tree Zigzag Level Order Traversal",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 52.7,
    "totalSubmissions": 107500,
    "description": [
      "Given the `root` of a binary tree, return its **zigzag level order traversal**: the first level left-to-right, the next right-to-left, alternating thereafter.",
      "Canonical must-do (AM-600 BFS family)."
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "[[3],[20,9],[15,7]]"
      },
      {
        "input": "root = [1]",
        "output": "[[1]]"
      }
    ],
    "constraints": [
      "0 <= number of nodes <= 2000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction zigzagLevelOrder(root) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction zigzagLevelOrder(root): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef zigzag_level_order(root):\n    pass\n"
    }
  },
  {
    "id": 1183,
    "slug": "as-far-from-land-as-possible",
    "title": "As Far from Land as Possible",
    "difficulty": "Medium",
    "tags": [
      "Breadth-First Search"
    ],
    "acceptanceRate": 34.2,
    "totalSubmissions": 185900,
    "description": [
      "Given an `n × n` grid of `0` (water) and `1` (land), find the **water** cell whose Manhattan distance to the nearest land is maximized, and return that distance. If the grid is all land or all water, return `-1`.",
      "Canonical must-do (AM-600 BFS family)."
    ],
    "examples": [
      {
        "input": "grid = [[1,0,1],[0,0,0],[1,0,1]]",
        "output": "2",
        "explanation": "The centre cell is distance 2 from every land."
      },
      {
        "input": "grid = [[1,0,0],[0,0,0],[0,0,0]]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= n <= 100",
      "grid[i][j] is 0 or 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxDistance(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxDistance(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_distance(grid):\n    pass\n"
    }
  },
  {
    "id": 1184,
    "slug": "longest-common-prefix",
    "title": "Longest Common Prefix",
    "difficulty": "Easy",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 66.9,
    "totalSubmissions": 89800,
    "description": [
      "Return the longest common prefix of all strings in `strs` (\"\" if there is none)."
    ],
    "examples": [
      {
        "input": "strs = [\"flower\",\"flow\",\"flight\"]",
        "output": "\"fl\""
      },
      {
        "input": "strs = [\"dog\",\"racecar\",\"car\"]",
        "output": "\"\""
      }
    ],
    "constraints": [
      "1 <= strs.length <= 200",
      "0 <= strs[i].length <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestCommonPrefix(strs) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestCommonPrefix(strs): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_common_prefix(strs):\n    pass\n"
    }
  },
  {
    "id": 1185,
    "slug": "implement-trie",
    "title": "Implement Trie (Prefix Tree)",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 35.2,
    "totalSubmissions": 133400,
    "description": [
      "Implement a trie by processing a list of operations. `ops` is an array of operation names (`\"insert\"`, `\"search\"`, `\"startsWith\"`) and `args[i]` holds the argument for `ops[i]`. Return an array with each operation's result (`null` for insert, boolean for the queries).",
      "`search(word)` is true only if the exact word was inserted; `startsWith(prefix)` is true if ANY inserted word begins with the prefix."
    ],
    "examples": [
      {
        "input": "ops = [\"insert\",\"search\",\"search\",\"startsWith\",\"insert\",\"search\"], args = [[\"apple\"],[\"apple\"],[\"app\"],[\"app\"],[\"app\"],[\"app\"]]",
        "output": "[null,true,false,true,null,true]"
      }
    ],
    "constraints": [
      "1 <= word.length <= 2000",
      "Lowercase letters only"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction trieOps(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction trieOps(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef trie_ops(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1186,
    "slug": "design-add-and-search-words",
    "title": "Design Add and Search Words",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 45.8,
    "totalSubmissions": 248100,
    "description": [
      "Process operations on a word dictionary: `\"addWord\"` stores a word; `\"search\"` returns whether any stored word matches the query, where `.` matches exactly one arbitrary character. Return each operation's result (`null` for adds)."
    ],
    "examples": [
      {
        "input": "ops = [\"addWord\",\"addWord\",\"addWord\",\"search\",\"search\",\"search\",\"search\"], args = [[\"bad\"],[\"dad\"],[\"mad\"],[\"pad\"],[\"bad\"],[\".ad\"],[\"b..\"]]",
        "output": "[null,null,null,false,true,true,true]"
      }
    ],
    "constraints": [
      "1 <= word.length <= 25",
      "Search may contain '.'"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wordDictionary(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wordDictionary(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef word_dictionary(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1187,
    "slug": "replace-words",
    "title": "Replace Words",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 56.1,
    "totalSubmissions": 127700,
    "description": [
      "Given a `dictionary` of roots and a `sentence`, replace every word that starts with a root by its SHORTEST root. Return the sentence."
    ],
    "examples": [
      {
        "input": "dictionary = [\"cat\",\"bat\",\"rat\"], sentence = \"the cattle was rattled by the battery\"",
        "output": "\"the cat was rat by the bat\""
      },
      {
        "input": "dictionary = [\"a\",\"b\",\"c\"], sentence = \"aadsfasf absbs bbab cadsfafs\"",
        "output": "\"a a b c\""
      }
    ],
    "constraints": [
      "1 <= dictionary.length <= 1000",
      "1 <= sentence words <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction replaceWords(dictionary, sentence) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction replaceWords(dictionary, sentence): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef replace_words(dictionary, sentence):\n    pass\n"
    }
  },
  {
    "id": 1188,
    "slug": "longest-word-in-dictionary",
    "title": "Longest Word in Dictionary",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 42.8,
    "totalSubmissions": 70700,
    "description": [
      "Return the longest word in `words` that can be built one character at a time, where EVERY prefix of it is also a word in the list. Ties go to the lexicographically smallest word; return \"\" if none qualifies."
    ],
    "examples": [
      {
        "input": "words = [\"w\",\"wo\",\"wor\",\"worl\",\"world\"]",
        "output": "\"world\""
      },
      {
        "input": "words = [\"a\",\"banana\",\"app\",\"appl\",\"ap\",\"apply\",\"apple\"]",
        "output": "\"apple\"",
        "explanation": "Both apply and apple reach length 5; apple wins alphabetically."
      }
    ],
    "constraints": [
      "1 <= words.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestWord(words) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestWord(words): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_word(words):\n    pass\n"
    }
  },
  {
    "id": 1189,
    "slug": "map-sum-pairs",
    "title": "Map Sum Pairs",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 40.4,
    "totalSubmissions": 248100,
    "description": [
      "Process operations: `\"insert\"` stores a key with a value (overwriting an existing key), `\"sum\"` returns the sum of values of ALL keys starting with the given prefix. Return each operation's result (`null` for insert)."
    ],
    "examples": [
      {
        "input": "ops = [\"insert\",\"sum\",\"insert\",\"sum\"], args = [[\"apple\",3],[\"ap\"],[\"app\",2],[\"ap\"]]",
        "output": "[null,3,null,5]"
      }
    ],
    "constraints": [
      "1 <= key.length <= 50",
      "Values are integers"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mapSum(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mapSum(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef map_sum(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1190,
    "slug": "lexicographical-numbers",
    "title": "Lexicographical Numbers",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 51.5,
    "totalSubmissions": 185200,
    "description": [
      "Return the numbers 1..n sorted in LEXICOGRAPHICAL order (as strings would sort: 1, 10, 11, …, 2, 20, …), in O(n) time without sorting."
    ],
    "examples": [
      {
        "input": "n = 13",
        "output": "[1,10,11,12,13,2,3,4,5,6,7,8,9]"
      },
      {
        "input": "n = 2",
        "output": "[1,2]"
      }
    ],
    "constraints": [
      "1 <= n <= 5 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lexicalOrder(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lexicalOrder(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef lexical_order(n):\n    pass\n"
    }
  },
  {
    "id": 1191,
    "slug": "search-suggestions-system",
    "title": "Search Suggestions System",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 45.5,
    "totalSubmissions": 119300,
    "description": [
      "Given `products` and a `searchWord`, return for each prefix of `searchWord` (as the user types it) the three lexicographically smallest products starting with that prefix."
    ],
    "examples": [
      {
        "input": "products = [\"mobile\",\"mouse\",\"moneypot\",\"monitor\",\"mousepad\"], searchWord = \"mouse\"",
        "output": "[[\"mobile\",\"moneypot\",\"monitor\"],[\"mobile\",\"moneypot\",\"monitor\"],[\"mouse\",\"mousepad\"],[\"mouse\",\"mousepad\"],[\"mouse\",\"mousepad\"]]"
      },
      {
        "input": "products = [\"havana\"], searchWord = \"havana\"",
        "output": "[[\"havana\"],[\"havana\"],[\"havana\"],[\"havana\"],[\"havana\"],[\"havana\"]]"
      }
    ],
    "constraints": [
      "1 <= products.length <= 1000",
      "1 <= searchWord.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction suggestedProducts(products, searchWord) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction suggestedProducts(products, searchWord): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef suggested_products(products, searchWord):\n    pass\n"
    }
  },
  {
    "id": 1192,
    "slug": "maximum-xor-of-two-numbers",
    "title": "Maximum XOR of Two Numbers in an Array",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 59.3,
    "totalSubmissions": 271500,
    "description": [
      "Return the maximum value of `nums[i] XOR nums[j]` over all pairs (i may equal j)."
    ],
    "examples": [
      {
        "input": "nums = [3,10,5,25,2,8]",
        "output": "28",
        "explanation": "5 XOR 25 = 28."
      },
      {
        "input": "nums = [0]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2 * 10^5",
      "0 <= nums[i] <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMaximumXOR(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMaximumXOR(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_maximum_x_o_r(nums):\n    pass\n"
    }
  },
  {
    "id": 1193,
    "slug": "word-search-ii",
    "title": "Word Search II",
    "difficulty": "Hard",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 49.9,
    "totalSubmissions": 99700,
    "description": [
      "Given an `m × n` board of letters and a list `words`, return all words that can be formed by a path of adjacent cells (up/down/left/right), using each cell at most once per word."
    ],
    "examples": [
      {
        "input": "board = [[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]], words = [\"oath\",\"pea\",\"eat\",\"rain\"]",
        "output": "[\"eat\",\"oath\"]"
      },
      {
        "input": "board = [[\"a\",\"b\"],[\"c\",\"d\"]], words = [\"abcb\"]",
        "output": "[]"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 12",
      "1 <= words.length <= 3 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findWords(board, words) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findWords(board, words): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_words(board, words):\n    pass\n"
    }
  },
  {
    "id": 1194,
    "slug": "short-encoding-of-words",
    "title": "Short Encoding of Words",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 49.8,
    "totalSubmissions": 150900,
    "description": [
      "Encode a list of `words` into a reference string where each word appears followed by `\"#\"`, and a word may reuse another word's **suffix** (e.g. `\"me\"` is contained in `\"time#\"`). Return the length of the shortest possible encoding.",
      "Canonical must-do (AM-600 Trie family)."
    ],
    "examples": [
      {
        "input": "words = [\"time\",\"me\",\"bell\"]",
        "output": "10",
        "explanation": "\"time#bell#\" — \"me\" reuses \"time#\"."
      },
      {
        "input": "words = [\"t\"]",
        "output": "2"
      }
    ],
    "constraints": [
      "1 <= words.length <= 2000",
      "1 <= words[i].length <= 7"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minimumLengthEncoding(words) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minimumLengthEncoding(words): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef minimum_length_encoding(words):\n    pass\n"
    }
  },
  {
    "id": 1195,
    "slug": "camelcase-matching",
    "title": "Camelcase Matching",
    "difficulty": "Medium",
    "tags": [
      "Tries"
    ],
    "acceptanceRate": 59.1,
    "totalSubmissions": 227800,
    "description": [
      "A query matches `pattern` if you can insert **lowercase** letters into the pattern to make it equal the query (uppercase letters must line up exactly, in order). Return an array of booleans, one per query.",
      "Canonical must-do (AM-600 Trie / Two Pointers family)."
    ],
    "examples": [
      {
        "input": "queries = [\"FooBar\",\"FooBarTest\",\"FootBall\",\"FrameBuffer\",\"ForceFeedBack\"], pattern = \"FB\"",
        "output": "[true,false,true,true,false]"
      }
    ],
    "constraints": [
      "1 <= queries.length <= 100",
      "1 <= pattern.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction camelMatch(queries, pattern) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction camelMatch(queries, pattern): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef camel_match(queries, pattern):\n    pass\n"
    }
  },
  {
    "id": 1196,
    "slug": "last-stone-weight",
    "title": "Last Stone Weight",
    "difficulty": "Easy",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 51.5,
    "totalSubmissions": 122500,
    "description": [
      "Repeatedly take the two HEAVIEST stones (x ≤ y) and smash them: if equal both vanish; otherwise a stone of weight `y − x` remains. Return the weight of the last stone (0 if none)."
    ],
    "examples": [
      {
        "input": "stones = [2,7,4,1,8,1]",
        "output": "1",
        "explanation": "8&7→1, 4&2→2, 2&1→1, 1&1→0, leaving 1."
      },
      {
        "input": "stones = [1]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= stones.length <= 30"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lastStoneWeight(stones) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lastStoneWeight(stones): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef last_stone_weight(stones):\n    pass\n"
    }
  },
  {
    "id": 1197,
    "slug": "kth-largest-element-in-a-stream",
    "title": "Kth Largest Element in a Stream",
    "difficulty": "Easy",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 50.4,
    "totalSubmissions": 61800,
    "description": [
      "Process operations: `\"KthLargest\"` initializes with `k` and an array of scores; each `\"add\"` inserts a score and returns the kth LARGEST score seen so far. Return each operation's result (`null` for the constructor)."
    ],
    "examples": [
      {
        "input": "ops = [\"KthLargest\",\"add\",\"add\",\"add\",\"add\",\"add\"], args = [[3,[4,5,8,2]],[3],[5],[10],[9],[4]]",
        "output": "[null,4,5,5,8,8]"
      }
    ],
    "constraints": [
      "1 <= k <= 10^4",
      "It is guaranteed k elements exist by the first add"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kthLargest(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kthLargest(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef kth_largest(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1198,
    "slug": "kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 47.6,
    "totalSubmissions": 110400,
    "description": [
      "Given `nums` and `k`, return the kth LARGEST element (duplicates count separately, so it's the kth in sorted order, not the kth distinct value)."
    ],
    "examples": [
      {
        "input": "nums = [3,2,1,5,6,4], k = 2",
        "output": "5"
      },
      {
        "input": "nums = [3,2,3,1,2,4,5,5,6], k = 4",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= k <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findKthLargest(nums, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findKthLargest(nums, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_kth_largest(nums, k):\n    pass\n"
    }
  },
  {
    "id": 1199,
    "slug": "k-closest-points-to-origin",
    "title": "K Closest Points to Origin",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 62.5,
    "totalSubmissions": 173000,
    "description": [
      "Given `points` on a plane, return the `k` points closest to the origin (any order). Answers are unique for the given tests."
    ],
    "examples": [
      {
        "input": "points = [[1,3],[-2,2]], k = 1",
        "output": "[[-2,2]]",
        "explanation": "√8 < √10."
      },
      {
        "input": "points = [[3,3],[5,-1],[-2,4]], k = 2",
        "output": "[[3,3],[-2,4]]"
      }
    ],
    "constraints": [
      "1 <= k <= points.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kClosest(points, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kClosest(points, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef k_closest(points, k):\n    pass\n"
    }
  },
  {
    "id": 1200,
    "slug": "top-k-frequent-words",
    "title": "Top K Frequent Words",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 64.6,
    "totalSubmissions": 114600,
    "description": [
      "Return the `k` most frequent strings in `words`, ordered by frequency (highest first) and alphabetically within equal frequency."
    ],
    "examples": [
      {
        "input": "words = [\"i\",\"love\",\"leetcode\",\"i\",\"love\",\"coding\"], k = 2",
        "output": "[\"i\",\"love\"]"
      },
      {
        "input": "words = [\"the\",\"day\",\"is\",\"sunny\",\"the\",\"the\",\"the\",\"sunny\",\"is\",\"is\"], k = 4",
        "output": "[\"the\",\"is\",\"sunny\",\"day\"]"
      }
    ],
    "constraints": [
      "1 <= words.length <= 500",
      "1 <= k <= number of distinct words"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction topKFrequentWords(words, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction topKFrequentWords(words, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef top_k_frequent_words(words, k):\n    pass\n"
    }
  },
  {
    "id": 1201,
    "slug": "minimum-cost-to-connect-sticks",
    "title": "Minimum Cost to Connect Sticks",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 55.5,
    "totalSubmissions": 36900,
    "description": [
      "Connecting two sticks of lengths a and b costs `a + b` and produces one stick of length `a + b`. Return the minimum total cost to connect all `sticks` into one (0 if there's only one)."
    ],
    "examples": [
      {
        "input": "sticks = [2,4,3]",
        "output": "14",
        "explanation": "2+3=5, then 5+4=9; 5+9=14."
      },
      {
        "input": "sticks = [1,8,3,5]",
        "output": "30"
      },
      {
        "input": "sticks = [5]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= sticks.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction connectSticks(sticks) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction connectSticks(sticks): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef connect_sticks(sticks):\n    pass\n"
    }
  },
  {
    "id": 1202,
    "slug": "ugly-number-ii",
    "title": "Ugly Number II",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 49.2,
    "totalSubmissions": 146100,
    "description": [
      "An ugly number has no prime factors other than 2, 3, and 5 (1 counts). Return the `n`th ugly number."
    ],
    "examples": [
      {
        "input": "n = 10",
        "output": "12",
        "explanation": "1, 2, 3, 4, 5, 6, 8, 9, 10, 12."
      },
      {
        "input": "n = 1",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= n <= 1690"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nthUglyNumber(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction nthUglyNumber(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef nth_ugly_number(n):\n    pass\n"
    }
  },
  {
    "id": 1203,
    "slug": "task-scheduler",
    "title": "Task Scheduler",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 48.1,
    "totalSubmissions": 268200,
    "description": [
      "Given `tasks` (letters) and a cooldown `n`, identical tasks must be at least `n` intervals apart; the CPU can idle. Return the minimum number of intervals to finish all tasks."
    ],
    "examples": [
      {
        "input": "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2",
        "output": "8",
        "explanation": "A B idle A B idle A B."
      },
      {
        "input": "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 0",
        "output": "6"
      }
    ],
    "constraints": [
      "1 <= tasks.length <= 10^4",
      "0 <= n <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction leastInterval(tasks, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction leastInterval(tasks, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef least_interval(tasks, n):\n    pass\n"
    }
  },
  {
    "id": 1204,
    "slug": "furthest-building-you-can-reach",
    "title": "Furthest Building You Can Reach",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 45.3,
    "totalSubmissions": 245400,
    "description": [
      "Walking left to right over `heights`, climbing UP a difference `d > 0` costs either `d` bricks or one ladder (any size). Given `bricks` and `ladders`, return the furthest building index you can reach."
    ],
    "examples": [
      {
        "input": "heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1",
        "output": "4",
        "explanation": "Bricks for +5 and +3, ladder saved... best is index 4."
      },
      {
        "input": "heights = [14,3,19,3], bricks = 17, ladders = 0",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= heights.length <= 10^5",
      "0 <= bricks, ladders <= 10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction furthestBuilding(heights, bricks, ladders) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction furthestBuilding(heights, bricks, ladders): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef furthest_building(heights, bricks, ladders):\n    pass\n"
    }
  },
  {
    "id": 1205,
    "slug": "find-median-from-data-stream",
    "title": "Find Median from Data Stream",
    "difficulty": "Hard",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 41.2,
    "totalSubmissions": 62600,
    "description": [
      "Process operations: `\"addNum\"` inserts an integer; `\"findMedian\"` returns the median of all numbers so far (the mean of the two middle values when the count is even). Return each operation's result (`null` for adds)."
    ],
    "examples": [
      {
        "input": "ops = [\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"], args = [[1],[2],[],[3],[]]",
        "output": "[null,null,1.5,null,2]"
      }
    ],
    "constraints": [
      "-10^5 <= num <= 10^5",
      "findMedian is only called after at least one add"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction medianFinder(ops, args) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction medianFinder(ops, args): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef median_finder(ops, args):\n    pass\n"
    }
  },
  {
    "id": 1206,
    "slug": "kth-smallest-in-sorted-matrix",
    "title": "Kth Smallest Element in a Sorted Matrix",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 46.3,
    "totalSubmissions": 151800,
    "description": [
      "Given an `n × n` matrix where each row and each column is sorted ascending, return the `k`-th smallest element (in overall sorted order, counting duplicates).",
      "Canonical must-do (AM-600 Heap / Binary Search family)."
    ],
    "examples": [
      {
        "input": "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8",
        "output": "13"
      },
      {
        "input": "matrix = [[-5]], k = 1",
        "output": "-5"
      }
    ],
    "constraints": [
      "1 <= n <= 300",
      "1 <= k <= n^2"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kthSmallest(matrix, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kthSmallest(matrix, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef kth_smallest(matrix, k):\n    pass\n"
    }
  },
  {
    "id": 1207,
    "slug": "reduce-array-size-to-half",
    "title": "Reduce Array Size to the Half",
    "difficulty": "Medium",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 46.8,
    "totalSubmissions": 150400,
    "description": [
      "Choose a set of integers to remove entirely from `arr` so that **at least half** the array's elements are removed. Return the minimum size of such a set.",
      "Canonical must-do (AM-600 Heap / Greedy family)."
    ],
    "examples": [
      {
        "input": "arr = [3,3,3,3,5,5,5,2,2,7]",
        "output": "2",
        "explanation": "Removing 3s and 5s deletes 7 of 10."
      },
      {
        "input": "arr = [7,7,7,7,7,7]",
        "output": "1"
      }
    ],
    "constraints": [
      "2 <= arr.length <= 10^5",
      "arr.length is even"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minSetSize(arr) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minSetSize(arr): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_set_size(arr):\n    pass\n"
    }
  },
  {
    "id": 1208,
    "slug": "k-weakest-rows-in-a-matrix",
    "title": "The K Weakest Rows in a Matrix",
    "difficulty": "Easy",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 53.9,
    "totalSubmissions": 265100,
    "description": [
      "Each row of a binary `mat` has soldiers (`1`s) before civilians (`0`s). Row `i` is **weaker** than row `j` if it has fewer soldiers, or the same number but a smaller index. Return the indices of the `k` weakest rows, weakest first.",
      "Canonical must-do (AM-600 Heap family)."
    ],
    "examples": [
      {
        "input": "mat = [[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]], k = 3",
        "output": "[2,0,3]"
      },
      {
        "input": "mat = [[1,0,0,0],[1,1,1,1],[1,0,0,0],[1,0,0,0]], k = 2",
        "output": "[0,2]"
      }
    ],
    "constraints": [
      "2 <= mat.length <= 100",
      "1 <= k <= mat.length"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kWeakestRows(mat, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction kWeakestRows(mat, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef k_weakest_rows(mat, k):\n    pass\n"
    }
  },
  {
    "id": 1209,
    "slug": "minimum-number-of-refueling-stops",
    "title": "Minimum Number of Refueling Stops",
    "difficulty": "Hard",
    "tags": [
      "Heap / Priority Queue"
    ],
    "acceptanceRate": 37,
    "totalSubmissions": 244600,
    "description": [
      "A car starts with `startFuel` and burns 1 fuel per mile toward `target`. `stations[i] = [position, fuel]`. Return the minimum number of refueling stops to reach the target, or `-1` if impossible.",
      "Canonical must-do (AM-600 Heap / Greedy family)."
    ],
    "examples": [
      {
        "input": "target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]]",
        "output": "2"
      },
      {
        "input": "target = 100, startFuel = 1, stations = [[10,100]]",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= target <= 10^9",
      "0 <= stations.length <= 500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minRefuelStops(target, startFuel, stations) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minRefuelStops(target, startFuel, stations): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_refuel_stops(target, startFuel, stations):\n    pass\n"
    }
  },
  {
    "id": 1210,
    "slug": "subsets",
    "title": "Subsets",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 49.5,
    "totalSubmissions": 191100,
    "description": [
      "Given an array `nums` of distinct integers, return all possible subsets (the power set), in any order. No duplicate subsets."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]"
      },
      {
        "input": "nums = [0]",
        "output": "[[],[0]]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10",
      "all distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subsets(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subsets(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef subsets(nums):\n    pass\n"
    }
  },
  {
    "id": 1211,
    "slug": "subsets-ii",
    "title": "Subsets II",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 37.6,
    "totalSubmissions": 74300,
    "description": [
      "Given an array `nums` that MAY contain duplicates, return all unique subsets, in any order."
    ],
    "examples": [
      {
        "input": "nums = [1,2,2]",
        "output": "[[],[1],[2],[1,2],[2,2],[1,2,2]]"
      },
      {
        "input": "nums = [0]",
        "output": "[[],[0]]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subsetsWithDup(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction subsetsWithDup(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef subsets_with_dup(nums):\n    pass\n"
    }
  },
  {
    "id": 1212,
    "slug": "permutations",
    "title": "Permutations",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 41.4,
    "totalSubmissions": 218100,
    "description": [
      "Given an array `nums` of distinct integers, return all possible permutations, in any order."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"
      },
      {
        "input": "nums = [0,1]",
        "output": "[[0,1],[1,0]]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 6",
      "all distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction permute(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction permute(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef permute(nums):\n    pass\n"
    }
  },
  {
    "id": 1213,
    "slug": "combinations",
    "title": "Combinations",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 53.4,
    "totalSubmissions": 192800,
    "description": [
      "Given integers `n` and `k`, return all combinations of `k` numbers chosen from the range [1, n], in any order."
    ],
    "examples": [
      {
        "input": "n = 4, k = 2",
        "output": "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]"
      },
      {
        "input": "n = 1, k = 1",
        "output": "[[1]]"
      }
    ],
    "constraints": [
      "1 <= k <= n <= 20"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combine(n, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combine(n, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef combine(n, k):\n    pass\n"
    }
  },
  {
    "id": 1214,
    "slug": "combination-sum",
    "title": "Combination Sum",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 64.7,
    "totalSubmissions": 153300,
    "description": [
      "Given distinct `candidates` and a `target`, return all unique combinations that sum to target. The same number may be used unlimited times. Any order."
    ],
    "examples": [
      {
        "input": "candidates = [2,3,6,7], target = 7",
        "output": "[[2,2,3],[7]]"
      },
      {
        "input": "candidates = [2], target = 1",
        "output": "[]"
      }
    ],
    "constraints": [
      "1 <= candidates.length <= 30",
      "all distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combinationSum(candidates, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combinationSum(candidates, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef combination_sum(candidates, target):\n    pass\n"
    }
  },
  {
    "id": 1215,
    "slug": "combination-sum-ii",
    "title": "Combination Sum II",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 49.9,
    "totalSubmissions": 81200,
    "description": [
      "Given `candidates` (which may contain duplicates) and a `target`, return all unique combinations summing to target. Each number may be used at most once. Any order."
    ],
    "examples": [
      {
        "input": "candidates = [10,1,2,7,6,1,5], target = 8",
        "output": "[[1,1,6],[1,2,5],[1,7],[2,6]]"
      },
      {
        "input": "candidates = [2,5,2,1,2], target = 5",
        "output": "[[1,2,2],[5]]"
      }
    ],
    "constraints": [
      "1 <= candidates.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combinationSum2(candidates, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combinationSum2(candidates, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef combination_sum2(candidates, target):\n    pass\n"
    }
  },
  {
    "id": 1216,
    "slug": "word-search",
    "title": "Word Search",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 54.7,
    "totalSubmissions": 212800,
    "description": [
      "Given an m×n grid of characters `board` and a `word`, return `true` if the word can be formed from sequentially adjacent cells (horizontal/vertical neighbours), using each cell at most once."
    ],
    "examples": [
      {
        "input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"",
        "output": "true"
      },
      {
        "input": "same board, word = \"ABCB\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= board cells <= 200",
      "1 <= word.length <= 15"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction exist(board, word) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction exist(board, word): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef exist(board, word):\n    pass\n"
    }
  },
  {
    "id": 1217,
    "slug": "palindrome-partitioning",
    "title": "Palindrome Partitioning",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 34.6,
    "totalSubmissions": 206000,
    "description": [
      "Given a string `s`, partition it so every substring is a palindrome, and return all such partitionings. Any order."
    ],
    "examples": [
      {
        "input": "s = \"aab\"",
        "output": "[[\"a\",\"a\",\"b\"],[\"aa\",\"b\"]]"
      },
      {
        "input": "s = \"a\"",
        "output": "[[\"a\"]]"
      }
    ],
    "constraints": [
      "1 <= s.length <= 16"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction partition(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction partition(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef partition(s):\n    pass\n"
    }
  },
  {
    "id": 1218,
    "slug": "letter-combinations-of-a-phone-number",
    "title": "Letter Combinations of a Phone Number",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 37.3,
    "totalSubmissions": 72400,
    "description": [
      "Given a string of digits 2–9, return all letter combinations the digits could represent on a phone keypad (2 = abc, 3 = def, …, 9 = wxyz), in any order. Empty input → empty list."
    ],
    "examples": [
      {
        "input": "digits = \"23\"",
        "output": "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]"
      },
      {
        "input": "digits = \"\"",
        "output": "[]"
      },
      {
        "input": "digits = \"2\"",
        "output": "[\"a\",\"b\",\"c\"]"
      }
    ],
    "constraints": [
      "0 <= digits.length <= 4",
      "Digits 2–9 only"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction letterCombinations(digits) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction letterCombinations(digits): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef letter_combinations(digits):\n    pass\n"
    }
  },
  {
    "id": 1219,
    "slug": "n-queens",
    "title": "N-Queens",
    "difficulty": "Hard",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 49.7,
    "totalSubmissions": 174700,
    "description": [
      "Place `n` queens on an n×n board so no two attack each other (same row, column, or diagonal). Return ALL distinct solutions; each solution is an array of strings where 'Q' marks a queen and '.' an empty square."
    ],
    "examples": [
      {
        "input": "n = 4",
        "output": "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]"
      },
      {
        "input": "n = 1",
        "output": "[[\"Q\"]]"
      }
    ],
    "constraints": [
      "1 <= n <= 9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction solveNQueens(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction solveNQueens(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef solve_n_queens(n):\n    pass\n"
    }
  },
  {
    "id": 1220,
    "slug": "towers-of-hanoi",
    "title": "Towers of Hanoi",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 39.7,
    "totalSubmissions": 183100,
    "description": [
      "Move a stack of `n` disks from peg `0` to peg `2`, using peg `1` as spare. Rules: move one disk at a time, and never place a larger disk on a smaller one. Return the list of moves as `[from, to]` pairs, in order.",
      "From *interactive-coding-challenges* (Recursion & DP: Towers of Hanoi with 3 towers and N disks)."
    ],
    "examples": [
      {
        "input": "n = 1",
        "output": "[[0,2]]"
      },
      {
        "input": "n = 2",
        "output": "[[0,1],[0,2],[1,2]]",
        "explanation": "Small disk out of the way, big disk across, small disk on top."
      }
    ],
    "constraints": [
      "1 <= n <= 15"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hanoi(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hanoi(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef hanoi(n):\n    pass\n"
    }
  },
  {
    "id": 1221,
    "slug": "permutations-ii",
    "title": "Permutations II",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 57.2,
    "totalSubmissions": 221300,
    "description": [
      "Given a collection `nums` that may contain **duplicates**, return all **unique** permutations, in any order.",
      "Canonical must-do (AM-600 Backtracking family)."
    ],
    "examples": [
      {
        "input": "nums = [1,1,2]",
        "output": "[[1,1,2],[1,2,1],[2,1,1]]"
      },
      {
        "input": "nums = [1,2,3]",
        "output": "6 permutations"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 8"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction permuteUnique(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction permuteUnique(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef permute_unique(nums):\n    pass\n"
    }
  },
  {
    "id": 1222,
    "slug": "restore-ip-addresses",
    "title": "Restore IP Addresses",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 33.8,
    "totalSubmissions": 206100,
    "description": [
      "Given a string `s` of digits, return **all** valid IP addresses formable by inserting three dots (no reordering). A segment is valid if it's 0–255 and has no leading zero (except '0' itself). Any order of results is accepted.",
      "Canonical must-do (AM-600 Backtracking family)."
    ],
    "examples": [
      {
        "input": "s = \"25525511135\"",
        "output": "[\"255.255.11.135\",\"255.255.111.35\"]"
      },
      {
        "input": "s = \"0000\"",
        "output": "[\"0.0.0.0\"]"
      }
    ],
    "constraints": [
      "1 <= s.length <= 20",
      "s consists of digits only"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction restoreIpAddresses(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction restoreIpAddresses(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef restore_ip_addresses(s):\n    pass\n"
    }
  },
  {
    "id": 1223,
    "slug": "combination-sum-iii",
    "title": "Combination Sum III",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 54.6,
    "totalSubmissions": 162600,
    "description": [
      "Find all valid combinations of `k` numbers that sum to `n`, using only the digits `1..9`, each **at most once**. Return the combinations in any order (no duplicates).",
      "Canonical must-do (AM-600 Backtracking family)."
    ],
    "examples": [
      {
        "input": "k = 3, n = 7",
        "output": "[[1,2,4]]"
      },
      {
        "input": "k = 3, n = 9",
        "output": "[[1,2,6],[1,3,5],[2,3,4]]"
      }
    ],
    "constraints": [
      "2 <= k <= 9",
      "1 <= n <= 60"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combinationSum3(k, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction combinationSum3(k, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef combination_sum3(k, n):\n    pass\n"
    }
  },
  {
    "id": 1224,
    "slug": "letter-case-permutation",
    "title": "Letter Case Permutation",
    "difficulty": "Medium",
    "tags": [
      "Recursion & Backtracking"
    ],
    "acceptanceRate": 33.2,
    "totalSubmissions": 134500,
    "description": [
      "Given a string `s`, transform every **letter** to lowercase or uppercase independently to produce all possible strings. Digits stay unchanged. Return all results in any order.",
      "Canonical must-do (AM-600 Backtracking family)."
    ],
    "examples": [
      {
        "input": "s = \"a1b2\"",
        "output": "[\"a1b2\",\"a1B2\",\"A1b2\",\"A1B2\"]"
      },
      {
        "input": "s = \"3z4\"",
        "output": "[\"3z4\",\"3Z4\"]"
      }
    ],
    "constraints": [
      "1 <= s.length <= 12"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction letterCasePermutation(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction letterCasePermutation(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef letter_case_permutation(s):\n    pass\n"
    }
  },
  {
    "id": 1225,
    "slug": "max-area-of-island",
    "title": "Max Area of Island",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 64.5,
    "totalSubmissions": 71000,
    "description": [
      "Given an m×n binary grid (1 = land, 0 = water), return the area (cell count) of the largest island, or 0 if there is none."
    ],
    "examples": [
      {
        "input": "grid = [[0,0,1,0],[0,1,1,0],[0,0,0,1]]",
        "output": "3"
      },
      {
        "input": "grid = [[0,0,0],[0,0,0]]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= m, n <= 50"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxAreaOfIsland(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxAreaOfIsland(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_area_of_island(grid):\n    pass\n"
    }
  },
  {
    "id": 1226,
    "slug": "course-schedule",
    "title": "Course Schedule",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 45.5,
    "totalSubmissions": 261900,
    "description": [
      "There are `numCourses` labelled 0..n−1. `prerequisites[i] = [a, b]` means you must take b before a. Return `true` if you can finish every course."
    ],
    "examples": [
      {
        "input": "numCourses = 2, prerequisites = [[1,0]]",
        "output": "true"
      },
      {
        "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= numCourses <= 2000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canFinish(numCourses, prerequisites) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canFinish(numCourses, prerequisites): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_finish(numCourses, prerequisites):\n    pass\n"
    }
  },
  {
    "id": 1227,
    "slug": "number-of-connected-components",
    "title": "Number of Connected Components",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 62.7,
    "totalSubmissions": 220100,
    "description": [
      "Given `n` nodes labelled 0..n−1 and a list of undirected `edges`, return the number of connected components."
    ],
    "examples": [
      {
        "input": "n = 5, edges = [[0,1],[1,2],[3,4]]",
        "output": "2"
      },
      {
        "input": "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= n <= 2000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countComponents(n, edges) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countComponents(n, edges): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef count_components(n, edges):\n    pass\n"
    }
  },
  {
    "id": 1228,
    "slug": "rotting-oranges",
    "title": "Rotting Oranges",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 57.4,
    "totalSubmissions": 97500,
    "description": [
      "In a grid, 0 = empty, 1 = fresh orange, 2 = rotten. Each minute, a rotten orange rots its 4-directional fresh neighbours. Return the minutes until none are fresh, or -1 if some can never rot."
    ],
    "examples": [
      {
        "input": "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        "output": "4"
      },
      {
        "input": "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= m, n <= 10"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction orangesRotting(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction orangesRotting(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef oranges_rotting(grid):\n    pass\n"
    }
  },
  {
    "id": 1229,
    "slug": "pacific-atlantic-water-flow",
    "title": "Pacific Atlantic Water Flow",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 47.7,
    "totalSubmissions": 162700,
    "description": [
      "Given an m×n `heights` grid, the Pacific touches the top and left edges, the Atlantic the bottom and right. Water flows from a cell to an equal-or-lower neighbour. Return all cells [r, c] from which water can reach BOTH oceans (any order)."
    ],
    "examples": [
      {
        "input": "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
        "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]"
      },
      {
        "input": "heights = [[1]]",
        "output": "[[0,0]]"
      }
    ],
    "constraints": [
      "1 <= m, n <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pacificAtlantic(heights) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction pacificAtlantic(heights): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef pacific_atlantic(heights):\n    pass\n"
    }
  },
  {
    "id": 1230,
    "slug": "graph-valid-tree",
    "title": "Graph Valid Tree",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 59.2,
    "totalSubmissions": 227700,
    "description": [
      "Given `n` nodes (0..n−1) and an undirected edge list, return whether the edges form a VALID TREE: connected and acyclic."
    ],
    "examples": [
      {
        "input": "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
        "output": "true"
      },
      {
        "input": "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]",
        "output": "false",
        "explanation": "1-2-3 forms a cycle."
      }
    ],
    "constraints": [
      "1 <= n <= 2000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validTree(n, edges) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction validTree(n, edges): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef valid_tree(n, edges):\n    pass\n"
    }
  },
  {
    "id": 1231,
    "slug": "redundant-connection",
    "title": "Redundant Connection",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 46.3,
    "totalSubmissions": 139500,
    "description": [
      "A tree of n nodes got ONE extra edge. Given the edge list, return the edge that can be removed to restore a tree — if several qualify, the one appearing LAST in the input."
    ],
    "examples": [
      {
        "input": "edges = [[1,2],[1,3],[2,3]]",
        "output": "[2,3]"
      },
      {
        "input": "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
        "output": "[1,4]"
      }
    ],
    "constraints": [
      "3 <= n <= 1000",
      "Nodes are 1..n"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findRedundantConnection(edges) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findRedundantConnection(edges): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_redundant_connection(edges):\n    pass\n"
    }
  },
  {
    "id": 1232,
    "slug": "network-delay-time",
    "title": "Network Delay Time",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 36.7,
    "totalSubmissions": 222200,
    "description": [
      "`times[i] = [u, v, w]`: a signal takes `w` ms from node `u` to node `v` (directed). A signal starts at node `k`. Return the time for ALL `n` nodes to receive it, or `-1` if some node never does."
    ],
    "examples": [
      {
        "input": "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
        "output": "2"
      },
      {
        "input": "times = [[1,2,1]], n = 2, k = 2",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= k <= n <= 100",
      "1 <= w <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction networkDelayTime(times, n, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction networkDelayTime(times, n, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef network_delay_time(times, n, k):\n    pass\n"
    }
  },
  {
    "id": 1233,
    "slug": "min-cost-to-connect-all-points",
    "title": "Min Cost to Connect All Points",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 35.5,
    "totalSubmissions": 274500,
    "description": [
      "Connect all `points` (Manhattan distance = cost between any two) so every point reaches every other, at minimum total cost. Return that cost."
    ],
    "examples": [
      {
        "input": "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]",
        "output": "20"
      },
      {
        "input": "points = [[3,12],[-2,5],[-4,1]]",
        "output": "18"
      }
    ],
    "constraints": [
      "1 <= points.length <= 1000",
      "All points distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minCostConnectPoints(points) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minCostConnectPoints(points): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_cost_connect_points(points):\n    pass\n"
    }
  },
  {
    "id": 1234,
    "slug": "course-schedule-ii",
    "title": "Course Schedule II (build order)",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 41.6,
    "totalSubmissions": 243600,
    "description": [
      "There are `numCourses` courses labeled `0…numCourses-1`. `prerequisites[i] = [a, b]` means you must take course `b` **before** course `a`. Return a valid order to finish all courses. If several are valid, return the **lexicographically smallest** one (always take the lowest-numbered available course next). If it's impossible (a cycle), return `[]`.",
      "From *interactive-coding-challenges* (Graphs & Trees: find a build order given projects and dependencies)."
    ],
    "examples": [
      {
        "input": "numCourses = 2, prerequisites = [[1,0]]",
        "output": "[0,1]",
        "explanation": "Take 0, then 1."
      },
      {
        "input": "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
        "output": "[0,1,2,3]"
      }
    ],
    "constraints": [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= numCourses·(numCourses-1)"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findOrder(numCourses, prerequisites) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findOrder(numCourses, prerequisites): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_order(numCourses, prerequisites):\n    pass\n"
    }
  },
  {
    "id": 1235,
    "slug": "find-the-town-judge",
    "title": "Find the Town Judge",
    "difficulty": "Easy",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 79.4,
    "totalSubmissions": 60800,
    "description": [
      "In a town of `n` people (1..n), a **judge** trusts nobody, is trusted by everyone else, and there is at most one. `trust[i] = [a, b]` means person `a` trusts person `b`. Return the judge's label, or `-1`.",
      "Canonical must-do (AM-600 Graphs family)."
    ],
    "examples": [
      {
        "input": "n = 2, trust = [[1,2]]",
        "output": "2"
      },
      {
        "input": "n = 3, trust = [[1,3],[2,3],[3,1]]",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= n <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findJudge(n, trust) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findJudge(n, trust): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_judge(n, trust):\n    pass\n"
    }
  },
  {
    "id": 1236,
    "slug": "is-graph-bipartite",
    "title": "Is Graph Bipartite?",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 46.7,
    "totalSubmissions": 220100,
    "description": [
      "Given an undirected graph as an adjacency list (`graph[u]` lists u's neighbours), return `true` if it is **bipartite** — its nodes can be split into two sets so that every edge connects the two sets (equivalently, it's 2-colorable).",
      "Canonical must-do (AM-600 Graphs family)."
    ],
    "examples": [
      {
        "input": "graph = [[1,3],[0,2],[1,3],[0,2]]",
        "output": "true"
      },
      {
        "input": "graph = [[1,2,3],[0,2],[0,1,3],[0,2]]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= graph.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isBipartite(graph) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isBipartite(graph): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_bipartite(graph):\n    pass\n"
    }
  },
  {
    "id": 1237,
    "slug": "number-of-provinces",
    "title": "Number of Provinces",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 45.8,
    "totalSubmissions": 252100,
    "description": [
      "`isConnected[i][j] = 1` means city `i` and city `j` are directly connected. A **province** is a group of directly or indirectly connected cities. Return the number of provinces.",
      "Canonical must-do (AM-600 Graphs / Union-Find family)."
    ],
    "examples": [
      {
        "input": "isConnected = [[1,1,0],[1,1,0],[0,0,1]]",
        "output": "2"
      },
      {
        "input": "isConnected = [[1,0,0],[0,1,0],[0,0,1]]",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= n <= 200",
      "isConnected[i][i] === 1 and the matrix is symmetric"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findCircleNum(isConnected) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findCircleNum(isConnected): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_circle_num(isConnected):\n    pass\n"
    }
  },
  {
    "id": 1238,
    "slug": "find-center-of-star-graph",
    "title": "Find Center of Star Graph",
    "difficulty": "Easy",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 66.6,
    "totalSubmissions": 132900,
    "description": [
      "A **star graph** has one center node connected to every other node, and no other edges. Given the `edges` of such a graph, return the center node.",
      "Canonical must-do (AM-600 Graphs family)."
    ],
    "examples": [
      {
        "input": "edges = [[1,2],[2,3],[4,2]]",
        "output": "2"
      },
      {
        "input": "edges = [[1,2],[5,1],[1,3],[1,4]]",
        "output": "1"
      }
    ],
    "constraints": [
      "3 <= n <= 10^5",
      "edges describes a valid star graph"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findCenter(edges) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findCenter(edges): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_center(edges):\n    pass\n"
    }
  },
  {
    "id": 1239,
    "slug": "find-eventual-safe-states",
    "title": "Find Eventual Safe States",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 49.7,
    "totalSubmissions": 39800,
    "description": [
      "In a directed graph given as an adjacency list, a node is **safe** if every possible path starting from it leads to a terminal node (one with no outgoing edges) — i.e. it can never get stuck in a cycle. Return all safe nodes in ascending order.",
      "Canonical must-do (AM-600 Graphs family)."
    ],
    "examples": [
      {
        "input": "graph = [[1,2],[2,3],[5],[0],[5],[],[]]",
        "output": "[2,4,5,6]"
      },
      {
        "input": "graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]",
        "output": "[4]"
      }
    ],
    "constraints": [
      "1 <= graph.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction eventualSafeNodes(graph) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction eventualSafeNodes(graph): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef eventual_safe_nodes(graph):\n    pass\n"
    }
  },
  {
    "id": 1240,
    "slug": "minimum-vertices-to-reach-all-nodes",
    "title": "Minimum Number of Vertices to Reach All Nodes",
    "difficulty": "Medium",
    "tags": [
      "Graphs"
    ],
    "acceptanceRate": 46.9,
    "totalSubmissions": 129600,
    "description": [
      "Given a **directed acyclic graph** with `n` nodes and a list of `edges`, return the smallest set of vertices from which all nodes are reachable. (The answer is unique; return it in ascending order.)",
      "Canonical must-do (AM-600 Graphs family)."
    ],
    "examples": [
      {
        "input": "n = 6, edges = [[0,1],[0,2],[2,5],[3,4],[4,2]]",
        "output": "[0,3]"
      },
      {
        "input": "n = 5, edges = [[0,1],[2,1],[3,1],[1,4],[2,4]]",
        "output": "[0,2,3]"
      }
    ],
    "constraints": [
      "2 <= n <= 10^5",
      "The graph is a DAG"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findSmallestSetOfVertices(n, edges) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findSmallestSetOfVertices(n, edges): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_smallest_set_of_vertices(n, edges):\n    pass\n"
    }
  },
  {
    "id": 1241,
    "slug": "merge-intervals",
    "title": "Merge Intervals",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 48.1,
    "totalSubmissions": 268400,
    "description": [
      "Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals and return the non-overlapping intervals that cover the same ranges (sorted by start)."
    ],
    "examples": [
      {
        "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        "output": "[[1,6],[8,10],[15,18]]"
      },
      {
        "input": "intervals = [[1,4],[4,5]]",
        "output": "[[1,5]]"
      }
    ],
    "constraints": [
      "1 <= intervals.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction merge(intervals) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction merge(intervals): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef merge(intervals):\n    pass\n"
    }
  },
  {
    "id": 1242,
    "slug": "insert-interval",
    "title": "Insert Interval",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 50.2,
    "totalSubmissions": 144800,
    "description": [
      "Given a list of non-overlapping `intervals` sorted by start, insert `newInterval`, merging as needed, and return the result still sorted and non-overlapping."
    ],
    "examples": [
      {
        "input": "intervals = [[1,3],[6,9]], newInterval = [2,5]",
        "output": "[[1,5],[6,9]]"
      },
      {
        "input": "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
        "output": "[[1,2],[3,10],[12,16]]"
      }
    ],
    "constraints": [
      "0 <= intervals.length <= 10^4",
      "intervals is sorted by start"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction insert(intervals, newInterval) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction insert(intervals, newInterval): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef insert(intervals, newInterval):\n    pass\n"
    }
  },
  {
    "id": 1243,
    "slug": "non-overlapping-intervals",
    "title": "Non-overlapping Intervals",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 46.4,
    "totalSubmissions": 217900,
    "description": [
      "Given `intervals`, return the minimum number you must remove so the rest are non-overlapping."
    ],
    "examples": [
      {
        "input": "intervals = [[1,2],[2,3],[3,4],[1,3]]",
        "output": "1",
        "explanation": "Remove [1,3]."
      },
      {
        "input": "intervals = [[1,2],[1,2],[1,2]]",
        "output": "2"
      }
    ],
    "constraints": [
      "1 <= intervals.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction eraseOverlapIntervals(intervals) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction eraseOverlapIntervals(intervals): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef erase_overlap_intervals(intervals):\n    pass\n"
    }
  },
  {
    "id": 1244,
    "slug": "meeting-rooms",
    "title": "Meeting Rooms",
    "difficulty": "Easy",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 58.1,
    "totalSubmissions": 294400,
    "description": [
      "Given meeting time `intervals`, return `true` if a single person could attend all of them (no two overlap)."
    ],
    "examples": [
      {
        "input": "intervals = [[0,30],[5,10],[15,20]]",
        "output": "false"
      },
      {
        "input": "intervals = [[7,10],[2,4]]",
        "output": "true"
      }
    ],
    "constraints": [
      "0 <= intervals.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canAttendMeetings(intervals) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canAttendMeetings(intervals): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_attend_meetings(intervals):\n    pass\n"
    }
  },
  {
    "id": 1245,
    "slug": "meeting-rooms-ii",
    "title": "Meeting Rooms II",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 50.3,
    "totalSubmissions": 197100,
    "description": [
      "Given meeting time `intervals`, return the minimum number of rooms required so that no two overlapping meetings share a room."
    ],
    "examples": [
      {
        "input": "intervals = [[0,30],[5,10],[15,20]]",
        "output": "2"
      },
      {
        "input": "intervals = [[7,10],[2,4]]",
        "output": "1"
      }
    ],
    "constraints": [
      "0 <= intervals.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minMeetingRooms(intervals) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minMeetingRooms(intervals): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_meeting_rooms(intervals):\n    pass\n"
    }
  },
  {
    "id": 1246,
    "slug": "summary-ranges",
    "title": "Summary Ranges",
    "difficulty": "Easy",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 70.2,
    "totalSubmissions": 157600,
    "description": [
      "Given a SORTED array of unique integers, return the smallest list of ranges covering exactly its numbers: \"a->b\" for a run, \"a\" for a lone value."
    ],
    "examples": [
      {
        "input": "nums = [0,1,2,4,5,7]",
        "output": "[\"0->2\",\"4->5\",\"7\"]"
      },
      {
        "input": "nums = [0,2,3,4,6,8,9]",
        "output": "[\"0\",\"2->4\",\"6\",\"8->9\"]"
      }
    ],
    "constraints": [
      "0 <= nums.length <= 20",
      "Sorted, unique"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction summaryRanges(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction summaryRanges(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef summary_ranges(nums):\n    pass\n"
    }
  },
  {
    "id": 1247,
    "slug": "interval-list-intersections",
    "title": "Interval List Intersections",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 55.9,
    "totalSubmissions": 239500,
    "description": [
      "Given two lists of disjoint sorted intervals, return their intersections (every interval common to both lists)."
    ],
    "examples": [
      {
        "input": "first = [[0,2],[5,10],[13,23],[24,25]], second = [[1,5],[8,12],[15,24],[25,26]]",
        "output": "[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]"
      },
      {
        "input": "first = [], second = [[4,8]]",
        "output": "[]"
      }
    ],
    "constraints": [
      "0 <= lengths <= 1000",
      "Each list is sorted and disjoint"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction intervalIntersection(firstList, secondList) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction intervalIntersection(firstList, secondList): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef interval_intersection(firstList, secondList):\n    pass\n"
    }
  },
  {
    "id": 1248,
    "slug": "minimum-number-of-arrows-to-burst-balloons",
    "title": "Minimum Number of Arrows to Burst Balloons",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 51.6,
    "totalSubmissions": 192200,
    "description": [
      "Balloons are horizontal intervals `[start, end]`. A vertical arrow at x bursts every balloon with start ≤ x ≤ end. Return the minimum number of arrows to burst all balloons."
    ],
    "examples": [
      {
        "input": "points = [[10,16],[2,8],[1,6],[7,12]]",
        "output": "2",
        "explanation": "x = 6 and x = 11."
      },
      {
        "input": "points = [[1,2],[3,4],[5,6]]",
        "output": "3"
      },
      {
        "input": "points = [[1,2],[2,3],[3,4]]",
        "output": "2"
      }
    ],
    "constraints": [
      "1 <= points.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMinArrowShots(points) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findMinArrowShots(points): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_min_arrow_shots(points):\n    pass\n"
    }
  },
  {
    "id": 1249,
    "slug": "car-pooling",
    "title": "Car Pooling",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 37.5,
    "totalSubmissions": 51100,
    "description": [
      "`trips[i] = [passengers, from, to]`: passengers ride from km `from` to km `to` (dropped off AT to). The car drives one direction with `capacity` seats. Return whether all trips fit."
    ],
    "examples": [
      {
        "input": "trips = [[2,1,5],[3,3,7]], capacity = 4",
        "output": "false"
      },
      {
        "input": "trips = [[2,1,5],[3,3,7]], capacity = 5",
        "output": "true"
      },
      {
        "input": "trips = [[2,1,5],[3,5,7]], capacity = 3",
        "output": "true",
        "explanation": "Drop-off at 5 frees seats before the pickup at 5."
      }
    ],
    "constraints": [
      "1 <= trips.length <= 1000",
      "0 <= from < to <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction carPooling(trips, capacity) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction carPooling(trips, capacity): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef car_pooling(trips, capacity):\n    pass\n"
    }
  },
  {
    "id": 1250,
    "slug": "remove-covered-intervals",
    "title": "Remove Covered Intervals",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 41.1,
    "totalSubmissions": 101200,
    "description": [
      "Interval `[a,b]` is covered by `[c,d]` if c <= a and b <= d. Remove every covered interval and return how many REMAIN."
    ],
    "examples": [
      {
        "input": "intervals = [[1,4],[3,6],[2,8]]",
        "output": "2",
        "explanation": "[3,6] is covered by [2,8]."
      },
      {
        "input": "intervals = [[1,4],[2,3]]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= intervals.length <= 1000",
      "All intervals distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeCoveredIntervals(intervals) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction removeCoveredIntervals(intervals): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef remove_covered_intervals(intervals):\n    pass\n"
    }
  },
  {
    "id": 1251,
    "slug": "maximum-length-of-pair-chain",
    "title": "Maximum Length of Pair Chain",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 51.8,
    "totalSubmissions": 258300,
    "description": [
      "You're given `pairs` where each `pairs[i] = [a, b]` with `a < b`. Pair `[c, d]` can follow `[a, b]` iff `b < c`. Return the length of the longest chain you can form (pairs can be used in any order).",
      "Canonical must-do (AM-600 Intervals / Greedy family)."
    ],
    "examples": [
      {
        "input": "pairs = [[1,2],[2,3],[3,4]]",
        "output": "2",
        "explanation": "[1,2] → [3,4]."
      },
      {
        "input": "pairs = [[1,2],[7,8],[4,5]]",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= pairs.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findLongestChain(pairs) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findLongestChain(pairs): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_longest_chain(pairs):\n    pass\n"
    }
  },
  {
    "id": 1252,
    "slug": "teemo-attacking",
    "title": "Teemo Attacking",
    "difficulty": "Easy",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 59.6,
    "totalSubmissions": 177000,
    "description": [
      "Attacks happen at the ascending times in `timeSeries`, each poisoning for `duration` seconds. A new attack **resets** (does not stack) the poison. Return the total number of seconds spent poisoned.",
      "Canonical must-do (AM-600 Intervals family)."
    ],
    "examples": [
      {
        "input": "timeSeries = [1,4], duration = 2",
        "output": "4",
        "explanation": "Poisoned at 1-2 and 4-5."
      },
      {
        "input": "timeSeries = [1,2], duration = 2",
        "output": "3",
        "explanation": "The second attack resets at 2."
      }
    ],
    "constraints": [
      "1 <= timeSeries.length <= 10^4",
      "0 <= duration <= 10^7"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findPoisonedDuration(timeSeries, duration) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findPoisonedDuration(timeSeries, duration): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_poisoned_duration(timeSeries, duration):\n    pass\n"
    }
  },
  {
    "id": 1253,
    "slug": "my-calendar-i",
    "title": "My Calendar I",
    "difficulty": "Medium",
    "tags": [
      "Intervals"
    ],
    "acceptanceRate": 63.3,
    "totalSubmissions": 243400,
    "description": [
      "Process a list of `bookings`, each `[start, end)`. A booking succeeds only if it does **not** overlap any previously accepted booking (touching endpoints are fine — `[10,20)` and `[20,30)` don't overlap). Return an array of booleans: whether each booking was accepted.",
      "Canonical must-do (AM-600 Intervals family)."
    ],
    "examples": [
      {
        "input": "bookings = [[10,20],[15,25],[20,30]]",
        "output": "[true,false,true]"
      },
      {
        "input": "bookings = [[1,10],[2,3]]",
        "output": "[true,false]"
      }
    ],
    "constraints": [
      "1 <= bookings.length <= 1000",
      "0 <= start < end <= 10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction myCalendar(bookings) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction myCalendar(bookings): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef my_calendar(bookings):\n    pass\n"
    }
  },
  {
    "id": 1254,
    "slug": "maximum-subarray",
    "title": "Maximum Subarray",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 47.5,
    "totalSubmissions": 60500,
    "description": [
      "Given an integer array `nums`, return the largest sum of any contiguous subarray (at least one element)."
    ],
    "examples": [
      {
        "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        "output": "6",
        "explanation": "[4,-1,2,1]."
      },
      {
        "input": "nums = [5,4,-1,7,8]",
        "output": "23"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxSubArray(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxSubArray(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_sub_array(nums):\n    pass\n"
    }
  },
  {
    "id": 1255,
    "slug": "jump-game",
    "title": "Jump Game",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 40.1,
    "totalSubmissions": 206700,
    "description": [
      "Given `nums` where `nums[i]` is the max jump length from index i, return `true` if you can reach the last index starting from index 0."
    ],
    "examples": [
      {
        "input": "nums = [2,3,1,1,4]",
        "output": "true"
      },
      {
        "input": "nums = [3,2,1,0,4]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canJump(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canJump(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_jump(nums):\n    pass\n"
    }
  },
  {
    "id": 1256,
    "slug": "jump-game-ii",
    "title": "Jump Game II",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 58.7,
    "totalSubmissions": 147100,
    "description": [
      "Given `nums` (as in Jump Game, and assuming the end is always reachable), return the minimum number of jumps to reach the last index."
    ],
    "examples": [
      {
        "input": "nums = [2,3,1,1,4]",
        "output": "2",
        "explanation": "Jump 1 to index 1, then 3 to the end."
      },
      {
        "input": "nums = [2,3,0,1,4]",
        "output": "2"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction jump(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction jump(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef jump(nums):\n    pass\n"
    }
  },
  {
    "id": 1257,
    "slug": "gas-station",
    "title": "Gas Station",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 59.7,
    "totalSubmissions": 231700,
    "description": [
      "There are n gas stations in a circle. `gas[i]` is the fuel at station i; `cost[i]` is the fuel to drive to station i+1. Starting with an empty tank, return the index of the station from which you can complete the loop, or -1. The answer is unique if it exists."
    ],
    "examples": [
      {
        "input": "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
        "output": "3"
      },
      {
        "input": "gas = [2,3,4], cost = [3,4,3]",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= n <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canCompleteCircuit(gas, cost) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canCompleteCircuit(gas, cost): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_complete_circuit(gas, cost):\n    pass\n"
    }
  },
  {
    "id": 1258,
    "slug": "hand-of-straights",
    "title": "Hand of Straights",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 62.7,
    "totalSubmissions": 180700,
    "description": [
      "Given an array `hand` of card values and a `groupSize`, return `true` if the cards can be rearranged into groups, each of `groupSize` consecutive values."
    ],
    "examples": [
      {
        "input": "hand = [1,2,3,6,2,3,4,7,8], groupSize = 3",
        "output": "true",
        "explanation": "[1,2,3],[2,3,4],[6,7,8]."
      },
      {
        "input": "hand = [1,2,3,4,5], groupSize = 4",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= hand.length <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isNStraightHand(hand, groupSize) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isNStraightHand(hand, groupSize): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_n_straight_hand(hand, groupSize):\n    pass\n"
    }
  },
  {
    "id": 1259,
    "slug": "assign-cookies",
    "title": "Assign Cookies",
    "difficulty": "Easy",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 58.2,
    "totalSubmissions": 210900,
    "description": [
      "Child `i` is content with a cookie of size ≥ `g[i]`; each child gets at most one cookie. Given greed factors `g` and cookie sizes `s`, return the maximum number of content children."
    ],
    "examples": [
      {
        "input": "g = [1,2,3], s = [1,1]",
        "output": "1"
      },
      {
        "input": "g = [1,2], s = [1,2,3]",
        "output": "2"
      }
    ],
    "constraints": [
      "0 <= lengths <= 3 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findContentChildren(g, s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findContentChildren(g, s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_content_children(g, s):\n    pass\n"
    }
  },
  {
    "id": 1260,
    "slug": "boats-to-save-people",
    "title": "Boats to Save People",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 36.8,
    "totalSubmissions": 80300,
    "description": [
      "Each boat carries at most TWO people with combined weight ≤ `limit` (everyone individually fits). Return the minimum number of boats for all `people`."
    ],
    "examples": [
      {
        "input": "people = [1,2], limit = 3",
        "output": "1"
      },
      {
        "input": "people = [3,2,2,1], limit = 3",
        "output": "3"
      },
      {
        "input": "people = [3,5,3,4], limit = 5",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= people.length <= 5 * 10^4",
      "1 <= people[i] <= limit"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numRescueBoats(people, limit) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numRescueBoats(people, limit): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_rescue_boats(people, limit):\n    pass\n"
    }
  },
  {
    "id": 1261,
    "slug": "partition-labels",
    "title": "Partition Labels",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 53.9,
    "totalSubmissions": 188100,
    "description": [
      "Split `s` into as MANY parts as possible so that each letter appears in at most one part; return the part sizes in order."
    ],
    "examples": [
      {
        "input": "s = \"ababcbacadefegdehijhklij\"",
        "output": "[9,7,8]"
      },
      {
        "input": "s = \"eccbbbbdec\"",
        "output": "[10]"
      }
    ],
    "constraints": [
      "1 <= s.length <= 500",
      "Lowercase letters"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction partitionLabels(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction partitionLabels(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef partition_labels(s):\n    pass\n"
    }
  },
  {
    "id": 1262,
    "slug": "valid-parenthesis-string",
    "title": "Valid Parenthesis String",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 42.8,
    "totalSubmissions": 74400,
    "description": [
      "`s` contains `(`, `)`, and `*`, where each `*` may stand for `(`, `)`, or the empty string. Return whether some interpretation makes `s` a valid parenthesis string."
    ],
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true"
      },
      {
        "input": "s = \"(*)\"",
        "output": "true"
      },
      {
        "input": "s = \"(*))\"",
        "output": "true"
      },
      {
        "input": "s = \")(\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction checkValidString(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction checkValidString(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef check_valid_string(s):\n    pass\n"
    }
  },
  {
    "id": 1263,
    "slug": "candy",
    "title": "Candy",
    "difficulty": "Hard",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 22.1,
    "totalSubmissions": 239500,
    "description": [
      "Children stand in a line with `ratings`. Each gets ≥ 1 candy, and anyone rated higher than an adjacent child must get more candies than that neighbour. Return the minimum total."
    ],
    "examples": [
      {
        "input": "ratings = [1,0,2]",
        "output": "5",
        "explanation": "Candies [2,1,2]."
      },
      {
        "input": "ratings = [1,2,2]",
        "output": "4",
        "explanation": "Candies [1,2,1]."
      }
    ],
    "constraints": [
      "1 <= ratings.length <= 2 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction candy(ratings) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction candy(ratings): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef candy(ratings):\n    pass\n"
    }
  },
  {
    "id": 1264,
    "slug": "best-time-to-buy-and-sell-stock-ii",
    "title": "Best Time to Buy and Sell Stock II",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 64.7,
    "totalSubmissions": 42500,
    "description": [
      "Given daily `prices`, you may buy and sell as many times as you like (but hold at most one share at a time — sell before buying again). Return the maximum total profit.",
      "From AlgoMaster **AM-600** (Arrays / Greedy)."
    ],
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "7",
        "explanation": "Buy 1 sell 5 (+4), buy 3 sell 6 (+3)."
      },
      {
        "input": "prices = [1,2,3,4,5]",
        "output": "4",
        "explanation": "Buy 1, sell 5."
      }
    ],
    "constraints": [
      "1 <= prices.length <= 3·10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProfit(prices) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProfit(prices): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_profit(prices):\n    pass\n"
    }
  },
  {
    "id": 1265,
    "slug": "increasing-triplet-subsequence",
    "title": "Increasing Triplet Subsequence",
    "difficulty": "Medium",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 60.7,
    "totalSubmissions": 100400,
    "description": [
      "Given an integer array `nums`, return `true` if there exist indices `i < j < k` with `nums[i] < nums[j] < nums[k]`.",
      "From AlgoMaster **AM-600** (Arrays / Greedy)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,4,5]",
        "output": "true"
      },
      {
        "input": "nums = [5,4,3,2,1]",
        "output": "false"
      },
      {
        "input": "nums = [2,1,5,0,4,6]",
        "output": "true",
        "explanation": "0 < 4 < 6."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5·10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction increasingTriplet(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction increasingTriplet(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef increasing_triplet(nums):\n    pass\n"
    }
  },
  {
    "id": 1266,
    "slug": "lemonade-change",
    "title": "Lemonade Change",
    "difficulty": "Easy",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 60.4,
    "totalSubmissions": 162500,
    "description": [
      "Each lemonade costs $5. Customers pay with a `5`, `10`, or `20` bill (in the order given by `bills`) and you must give correct change, starting with no cash. Return `true` if you can serve everyone.",
      "Canonical must-do (AM-600 Greedy family)."
    ],
    "examples": [
      {
        "input": "bills = [5,5,5,10,20]",
        "output": "true"
      },
      {
        "input": "bills = [5,5,10,10,20]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= bills.length <= 10^5",
      "bills[i] is 5, 10, or 20"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lemonadeChange(bills) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lemonadeChange(bills): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef lemonade_change(bills):\n    pass\n"
    }
  },
  {
    "id": 1267,
    "slug": "maximum-units-on-a-truck",
    "title": "Maximum Units on a Truck",
    "difficulty": "Easy",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 76,
    "totalSubmissions": 192100,
    "description": [
      "`boxTypes[i] = [numberOfBoxes, unitsPerBox]`. A truck holds at most `truckSize` boxes. Load boxes to maximize total **units**, and return that maximum.",
      "Canonical must-do (AM-600 Greedy family)."
    ],
    "examples": [
      {
        "input": "boxTypes = [[1,3],[2,2],[3,1]], truckSize = 4",
        "output": "8",
        "explanation": "1×3 + 2×2 + 1×1 = 8."
      },
      {
        "input": "boxTypes = [[5,10],[2,5],[4,7],[3,9]], truckSize = 10",
        "output": "91"
      }
    ],
    "constraints": [
      "1 <= boxTypes.length <= 1000",
      "1 <= truckSize <= 10^6"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximumUnits(boxTypes, truckSize) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximumUnits(boxTypes, truckSize): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef maximum_units(boxTypes, truckSize):\n    pass\n"
    }
  },
  {
    "id": 1268,
    "slug": "can-place-flowers",
    "title": "Can Place Flowers",
    "difficulty": "Easy",
    "tags": [
      "Greedy"
    ],
    "acceptanceRate": 58.2,
    "totalSubmissions": 131300,
    "description": [
      "A `flowerbed` array has `0` for empty plots and `1` for planted ones. Flowers cannot be planted in **adjacent** plots. Return `true` if `n` new flowers can be planted without violating that rule.",
      "Canonical must-do (AM-600 Greedy family)."
    ],
    "examples": [
      {
        "input": "flowerbed = [1,0,0,0,1], n = 1",
        "output": "true"
      },
      {
        "input": "flowerbed = [1,0,0,0,1], n = 2",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= flowerbed.length <= 2·10^4",
      "flowerbed[i] is 0 or 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canPlaceFlowers(flowerbed, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canPlaceFlowers(flowerbed, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_place_flowers(flowerbed, n):\n    pass\n"
    }
  },
  {
    "id": 1269,
    "slug": "climbing-stairs",
    "title": "Climbing Stairs",
    "difficulty": "Easy",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 47.4,
    "totalSubmissions": 279100,
    "description": [
      "You climb `n` stairs, 1 or 2 steps at a time. Return the number of distinct ways to reach the top."
    ],
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "1+1, or 2."
      },
      {
        "input": "n = 3",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= n <= 45"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction climbStairs(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction climbStairs(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef climb_stairs(n):\n    pass\n"
    }
  },
  {
    "id": 1270,
    "slug": "min-cost-climbing-stairs",
    "title": "Min Cost Climbing Stairs",
    "difficulty": "Easy",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 68.5,
    "totalSubmissions": 187200,
    "description": [
      "`cost[i]` is the price to step off stair i (then move 1 or 2 stairs up). You may start at index 0 or 1. Return the minimum cost to reach the top (just past the last stair)."
    ],
    "examples": [
      {
        "input": "cost = [10,15,20]",
        "output": "15",
        "explanation": "Start at index 1, pay 15, step two to the top."
      },
      {
        "input": "cost = [1,100,1,1,1,100,1,1,100,1]",
        "output": "6"
      }
    ],
    "constraints": [
      "2 <= cost.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minCostClimbingStairs(cost) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minCostClimbingStairs(cost): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_cost_climbing_stairs(cost):\n    pass\n"
    }
  },
  {
    "id": 1271,
    "slug": "house-robber",
    "title": "House Robber",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 35.7,
    "totalSubmissions": 36000,
    "description": [
      "Given `nums` (money in each house along a street), return the maximum you can rob without ever taking two adjacent houses."
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "4",
        "explanation": "Rob houses 0 and 2."
      },
      {
        "input": "nums = [2,7,9,3,1]",
        "output": "12"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rob(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rob(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef rob(nums):\n    pass\n"
    }
  },
  {
    "id": 1272,
    "slug": "house-robber-ii",
    "title": "House Robber II",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 44.6,
    "totalSubmissions": 118400,
    "description": [
      "The houses are arranged in a CIRCLE, so the first and last are adjacent. Return the max you can rob without taking two adjacent houses."
    ],
    "examples": [
      {
        "input": "nums = [2,3,2]",
        "output": "3",
        "explanation": "Can't rob both ends; take house 1."
      },
      {
        "input": "nums = [1,2,3,1]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction robII(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction robII(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef rob_i_i(nums):\n    pass\n"
    }
  },
  {
    "id": 1273,
    "slug": "longest-increasing-subsequence",
    "title": "Longest Increasing Subsequence",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 35.1,
    "totalSubmissions": 41100,
    "description": [
      "Given `nums`, return the length of the longest strictly increasing subsequence (elements need not be contiguous)."
    ],
    "examples": [
      {
        "input": "nums = [10,9,2,5,3,7,101,18]",
        "output": "4",
        "explanation": "[2,3,7,101]."
      },
      {
        "input": "nums = [0,1,0,3,2,3]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLIS(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction lengthOfLIS(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef length_of_l_i_s(nums):\n    pass\n"
    }
  },
  {
    "id": 1274,
    "slug": "word-break",
    "title": "Word Break",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 40.5,
    "totalSubmissions": 250500,
    "description": [
      "Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words (each word reusable)."
    ],
    "examples": [
      {
        "input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
        "output": "true"
      },
      {
        "input": "s = \"catsandog\", wordDict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 300"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wordBreak(s, wordDict) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction wordBreak(s, wordDict): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef word_break(s, wordDict):\n    pass\n"
    }
  },
  {
    "id": 1275,
    "slug": "longest-common-subsequence",
    "title": "Longest Common Subsequence",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 57.6,
    "totalSubmissions": 231100,
    "description": [
      "Given two strings `text1` and `text2`, return the length of their longest common subsequence (characters in order, not necessarily contiguous). Return 0 if there is none."
    ],
    "examples": [
      {
        "input": "text1 = \"abcde\", text2 = \"ace\"",
        "output": "3",
        "explanation": "\"ace\"."
      },
      {
        "input": "text1 = \"abc\", text2 = \"def\"",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= text1.length, text2.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestCommonSubsequence(text1, text2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestCommonSubsequence(text1, text2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_common_subsequence(text1, text2):\n    pass\n"
    }
  },
  {
    "id": 1276,
    "slug": "unique-paths",
    "title": "Unique Paths",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 52.9,
    "totalSubmissions": 86300,
    "description": [
      "A robot starts at the top-left of an `m × n` grid and moves only RIGHT or DOWN. Return the number of distinct paths to the bottom-right corner."
    ],
    "examples": [
      {
        "input": "m = 3, n = 7",
        "output": "28"
      },
      {
        "input": "m = 3, n = 2",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= m, n <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction uniquePaths(m, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction uniquePaths(m, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef unique_paths(m, n):\n    pass\n"
    }
  },
  {
    "id": 1277,
    "slug": "edit-distance",
    "title": "Edit Distance",
    "difficulty": "Hard",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 38.1,
    "totalSubmissions": 166000,
    "description": [
      "Return the minimum number of operations (insert a character, delete a character, replace a character) to convert `word1` into `word2`."
    ],
    "examples": [
      {
        "input": "word1 = \"horse\", word2 = \"ros\"",
        "output": "3",
        "explanation": "horse → rorse → rose → ros."
      },
      {
        "input": "word1 = \"intention\", word2 = \"execution\"",
        "output": "5"
      }
    ],
    "constraints": [
      "0 <= lengths <= 500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minDistance(word1, word2) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minDistance(word1, word2): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_distance(word1, word2):\n    pass\n"
    }
  },
  {
    "id": 1278,
    "slug": "0-1-knapsack",
    "title": "0/1 Knapsack",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 38.7,
    "totalSubmissions": 43200,
    "description": [
      "Given item `weights` and `values` (same length) and a knapsack `capacity`, choose a subset of items whose total weight is ≤ capacity to **maximize total value**. Each item may be taken at most once (0 or 1). Return the maximum value.",
      "From *interactive-coding-challenges* (Recursion & DP: maximize items placed in a knapsack)."
    ],
    "examples": [
      {
        "input": "weights = [1,3,4,5], values = [1,4,5,7], capacity = 7",
        "output": "9",
        "explanation": "Take items of weight 3 and 4 → value 4 + 5 = 9."
      },
      {
        "input": "weights = [2,3,4], values = [3,4,5], capacity = 5",
        "output": "7"
      }
    ],
    "constraints": [
      "1 <= weights.length <= 100",
      "0 <= capacity <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction knapsack(weights, values, capacity) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction knapsack(weights, values, capacity): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef knapsack(weights, values, capacity):\n    pass\n"
    }
  },
  {
    "id": 1279,
    "slug": "coin-change-ii",
    "title": "Coin Change II (count combinations)",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 39.7,
    "totalSubmissions": 247600,
    "description": [
      "Given coin denominations `coins` (unlimited supply of each) and a target `amount`, return the **number of distinct combinations** that sum to the amount. Order doesn't matter — `1+2` and `2+1` count once. Return 0 if it can't be made.",
      "From *interactive-coding-challenges* (Recursion & DP: unique number of ways to represent n cents)."
    ],
    "examples": [
      {
        "input": "amount = 5, coins = [1,2,5]",
        "output": "4",
        "explanation": "5; 2+2+1; 2+1+1+1; 1+1+1+1+1."
      },
      {
        "input": "amount = 3, coins = [2]",
        "output": "0"
      }
    ],
    "constraints": [
      "0 <= amount <= 5000",
      "1 <= coins.length <= 300",
      "coin values are distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction change(amount, coins) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction change(amount, coins): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef change(amount, coins):\n    pass\n"
    }
  },
  {
    "id": 1280,
    "slug": "partition-equal-subset-sum",
    "title": "Partition Equal Subset Sum",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 49.6,
    "totalSubmissions": 156600,
    "description": [
      "Given an array `nums` of positive integers, return `true` if it can be partitioned into two subsets with **equal sum**.",
      "Canonical must-do (AM-600 DP family). A 0/1-knapsack / subset-sum problem."
    ],
    "examples": [
      {
        "input": "nums = [1,5,11,5]",
        "output": "true",
        "explanation": "[1,5,5] and [11]."
      },
      {
        "input": "nums = [1,2,3,5]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 200",
      "1 <= nums[i] <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canPartition(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canPartition(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_partition(nums):\n    pass\n"
    }
  },
  {
    "id": 1281,
    "slug": "decode-ways",
    "title": "Decode Ways",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 48.5,
    "totalSubmissions": 209700,
    "description": [
      "A message of digits is encoded with A=1 … Z=26. Given a digit string `s`, return the number of ways to decode it. A leading `0`, or any `0` that can't pair into 10/20, contributes no valid decoding.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "s = \"12\"",
        "output": "2",
        "explanation": "\"AB\" (1 2) or \"L\" (12)."
      },
      {
        "input": "s = \"226\"",
        "output": "3",
        "explanation": "\"BZ\", \"VF\", \"BBF\"."
      },
      {
        "input": "s = \"06\"",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= s.length <= 100",
      "s contains only digits"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numDecodings(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numDecodings(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef num_decodings(s):\n    pass\n"
    }
  },
  {
    "id": 1282,
    "slug": "maximum-product-subarray",
    "title": "Maximum Product Subarray",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 49.3,
    "totalSubmissions": 241800,
    "description": [
      "Given an integer array `nums`, find a contiguous non-empty subarray with the **largest product**, and return that product.",
      "Canonical must-do (AM-600 DP / Arrays family)."
    ],
    "examples": [
      {
        "input": "nums = [2,3,-2,4]",
        "output": "6",
        "explanation": "[2,3] → 6."
      },
      {
        "input": "nums = [-2,3,-4]",
        "output": "24",
        "explanation": "[-2,3,-4] → 24."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2·10^4",
      "-10 <= nums[i] <= 10"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProduct(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProduct(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_product(nums):\n    pass\n"
    }
  },
  {
    "id": 1283,
    "slug": "minimum-path-sum",
    "title": "Minimum Path Sum",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 53.8,
    "totalSubmissions": 187600,
    "description": [
      "Given an `m × n` grid of non-negative numbers, find a path from top-left to bottom-right that **minimizes the sum** of the numbers along it. You may only move right or down. Return that minimum sum.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "grid = [[1,3,1],[1,5,1],[4,2,1]]",
        "output": "7",
        "explanation": "1→3→1→1→1."
      },
      {
        "input": "grid = [[1,2,3],[4,5,6]]",
        "output": "12"
      }
    ],
    "constraints": [
      "1 <= m, n <= 200",
      "0 <= grid[i][j] <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minPathSum(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minPathSum(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_path_sum(grid):\n    pass\n"
    }
  },
  {
    "id": 1284,
    "slug": "unique-paths-ii",
    "title": "Unique Paths II (with obstacles)",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 55.6,
    "totalSubmissions": 235200,
    "description": [
      "A robot starts at the top-left of an `m × n` grid and wants to reach the bottom-right, moving only right or down. Cells marked `1` are **obstacles** (impassable), `0` is free. Return the number of distinct paths.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "grid = [[0,0,0],[0,1,0],[0,0,0]]",
        "output": "2"
      },
      {
        "input": "grid = [[0,1],[0,0]]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= m, n <= 100",
      "grid[i][j] is 0 or 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction uniquePathsWithObstacles(grid) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction uniquePathsWithObstacles(grid): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef unique_paths_with_obstacles(grid):\n    pass\n"
    }
  },
  {
    "id": 1285,
    "slug": "target-sum",
    "title": "Target Sum",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 61.5,
    "totalSubmissions": 216300,
    "description": [
      "Given an array `nums` and an integer `target`, put a `+` or `−` in front of each number so the resulting expression equals `target`. Return the **number of ways** to do it.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "nums = [1,1,1,1,1], target = 3",
        "output": "5"
      },
      {
        "input": "nums = [1], target = 1",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 20",
      "0 <= nums[i] <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findTargetSumWays(nums, target) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findTargetSumWays(nums, target): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_target_sum_ways(nums, target):\n    pass\n"
    }
  },
  {
    "id": 1286,
    "slug": "maximal-square",
    "title": "Maximal Square",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 43.6,
    "totalSubmissions": 189600,
    "description": [
      "Given a binary `matrix` of `0`s and `1`s, find the largest **square** containing only 1s and return its **area**.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "matrix = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]",
        "output": "4"
      },
      {
        "input": "matrix = [[0,1],[1,0]]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 300",
      "matrix[i][j] is 0 or 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximalSquare(matrix) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maximalSquare(matrix): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef maximal_square(matrix):\n    pass\n"
    }
  },
  {
    "id": 1287,
    "slug": "longest-palindromic-substring",
    "title": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 62,
    "totalSubmissions": 218500,
    "description": [
      "Given a string `s`, return the **longest palindromic substring**. If several have the same maximum length, return the **leftmost** one.",
      "Canonical must-do (AM-600 DP / Strings family)."
    ],
    "examples": [
      {
        "input": "s = \"babad\"",
        "output": "\"bab\"",
        "explanation": "\"aba\" is also length 3, but \"bab\" starts earlier."
      },
      {
        "input": "s = \"cbbd\"",
        "output": "\"bb\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestPalindromicSubstring(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction longestPalindromicSubstring(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef longest_palindromic_substring(s):\n    pass\n"
    }
  },
  {
    "id": 1288,
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown",
    "title": "Best Time to Buy and Sell Stock with Cooldown",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 42,
    "totalSubmissions": 184800,
    "description": [
      "Given daily `prices`, maximize profit with unlimited transactions, except: after you **sell**, you must wait one day (cooldown) before buying again. You may hold at most one share.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "prices = [1,2,3,0,2]",
        "output": "3",
        "explanation": "buy 1, sell 2, cooldown, buy 0, sell 2."
      },
      {
        "input": "prices = [1]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= prices.length <= 5000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProfitCooldown(prices) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProfitCooldown(prices): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_profit_cooldown(prices):\n    pass\n"
    }
  },
  {
    "id": 1289,
    "slug": "integer-break",
    "title": "Integer Break",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 52,
    "totalSubmissions": 188900,
    "description": [
      "Given an integer `n`, break it into the sum of **at least two** positive integers and maximize the product of those integers. Return that maximum product.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "n = 2",
        "output": "1",
        "explanation": "2 = 1 + 1."
      },
      {
        "input": "n = 10",
        "output": "36",
        "explanation": "10 = 3 + 3 + 4."
      }
    ],
    "constraints": [
      "2 <= n <= 58"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction integerBreak(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction integerBreak(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef integer_break(n):\n    pass\n"
    }
  },
  {
    "id": 1290,
    "slug": "minimum-falling-path-sum",
    "title": "Minimum Falling Path Sum",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming"
    ],
    "acceptanceRate": 43.1,
    "totalSubmissions": 116200,
    "description": [
      "Given an `n × n` matrix, a **falling path** starts at any cell in the first row and moves down, each step going to the cell directly below or diagonally below-left/below-right. Return the minimum sum of any falling path.",
      "Canonical must-do (AM-600 DP family)."
    ],
    "examples": [
      {
        "input": "matrix = [[2,1,3],[6,5,4],[7,8,9]]",
        "output": "13",
        "explanation": "1 → 4 → 8."
      },
      {
        "input": "matrix = [[-19,57],[-40,-5]]",
        "output": "-59"
      }
    ],
    "constraints": [
      "1 <= n <= 100",
      "-100 <= matrix[i][j] <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minFallingPathSum(matrix) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction minFallingPathSum(matrix): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef min_falling_path_sum(matrix):\n    pass\n"
    }
  },
  {
    "id": 1291,
    "slug": "single-number",
    "title": "Single Number",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 71.7,
    "totalSubmissions": 85100,
    "description": [
      "Every element of `nums` appears exactly twice except one, which appears once. Find it in linear time and CONSTANT extra space."
    ],
    "examples": [
      {
        "input": "nums = [2,2,1]",
        "output": "1"
      },
      {
        "input": "nums = [4,1,2,1,2]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 3 * 10^4",
      "Exactly one element appears once"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNumber(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNumber(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef single_number(nums):\n    pass\n"
    }
  },
  {
    "id": 1292,
    "slug": "number-of-1-bits",
    "title": "Number of 1 Bits",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 78.3,
    "totalSubmissions": 207700,
    "description": [
      "Return the number of `1` bits in the binary representation of the non-negative integer `n` (its Hamming weight)."
    ],
    "examples": [
      {
        "input": "n = 11",
        "output": "3",
        "explanation": "1011."
      },
      {
        "input": "n = 128",
        "output": "1"
      }
    ],
    "constraints": [
      "0 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hammingWeight(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hammingWeight(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef hamming_weight(n):\n    pass\n"
    }
  },
  {
    "id": 1293,
    "slug": "counting-bits",
    "title": "Counting Bits",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 66.3,
    "totalSubmissions": 217800,
    "description": [
      "Return an array `ans` of length `n + 1` where `ans[i]` is the number of `1` bits in `i`. Aim for O(n) — not O(n log n)."
    ],
    "examples": [
      {
        "input": "n = 2",
        "output": "[0,1,1]"
      },
      {
        "input": "n = 5",
        "output": "[0,1,1,2,1,2]"
      }
    ],
    "constraints": [
      "0 <= n <= 10^5"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countBits(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countBits(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef count_bits(n):\n    pass\n"
    }
  },
  {
    "id": 1294,
    "slug": "missing-number",
    "title": "Missing Number",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 54.7,
    "totalSubmissions": 122800,
    "description": [
      "`nums` contains n distinct numbers from the range `[0, n]` — one number of the range is missing. Return it in O(n) time, O(1) space."
    ],
    "examples": [
      {
        "input": "nums = [3,0,1]",
        "output": "2"
      },
      {
        "input": "nums = [0,1]",
        "output": "2"
      },
      {
        "input": "nums = [9,6,4,2,3,5,7,0,1]",
        "output": "8"
      }
    ],
    "constraints": [
      "1 <= n <= 10^4",
      "All numbers distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction missingNumber(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction missingNumber(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef missing_number(nums):\n    pass\n"
    }
  },
  {
    "id": 1295,
    "slug": "power-of-two",
    "title": "Power of Two",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 59.6,
    "totalSubmissions": 122500,
    "description": [
      "Return `true` if the integer `n` is a power of two (n = 2^k for some k ≥ 0), without loops or recursion if you can."
    ],
    "examples": [
      {
        "input": "n = 1",
        "output": "true",
        "explanation": "2^0."
      },
      {
        "input": "n = 16",
        "output": "true"
      },
      {
        "input": "n = 3",
        "output": "false"
      }
    ],
    "constraints": [
      "-2^31 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPowerOfTwo(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPowerOfTwo(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_power_of_two(n):\n    pass\n"
    }
  },
  {
    "id": 1296,
    "slug": "reverse-bits",
    "title": "Reverse Bits",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 63.9,
    "totalSubmissions": 66900,
    "description": [
      "Reverse the bits of a 32-bit UNSIGNED integer and return the resulting unsigned integer."
    ],
    "examples": [
      {
        "input": "n = 43261596",
        "output": "964176192",
        "explanation": "00000010100101000001111010011100 → 00111001011110000010100101000000."
      },
      {
        "input": "n = 4294967293",
        "output": "3221225471"
      }
    ],
    "constraints": [
      "0 <= n < 2^32"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseBits(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverseBits(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse_bits(n):\n    pass\n"
    }
  },
  {
    "id": 1297,
    "slug": "single-number-ii",
    "title": "Single Number II",
    "difficulty": "Medium",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 59.8,
    "totalSubmissions": 71800,
    "description": [
      "Every element of `nums` appears exactly THREE times except one, which appears once. Find it in linear time and constant space."
    ],
    "examples": [
      {
        "input": "nums = [2,2,3,2]",
        "output": "3"
      },
      {
        "input": "nums = [0,1,0,1,0,1,99]",
        "output": "99"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 3 * 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNumber(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNumber(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef single_number(nums):\n    pass\n"
    }
  },
  {
    "id": 1298,
    "slug": "sum-of-two-integers",
    "title": "Sum of Two Integers",
    "difficulty": "Medium",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 59.2,
    "totalSubmissions": 151300,
    "description": [
      "Return `a + b` without using the `+` or `-` operators. Inputs fit in 32-bit signed range."
    ],
    "examples": [
      {
        "input": "a = 1, b = 2",
        "output": "3"
      },
      {
        "input": "a = 2, b = 3",
        "output": "5"
      },
      {
        "input": "a = -1, b = 1",
        "output": "0"
      }
    ],
    "constraints": [
      "-1000 <= a, b <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getSum(a, b) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getSum(a, b): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef get_sum(a, b):\n    pass\n"
    }
  },
  {
    "id": 1299,
    "slug": "bitwise-and-of-numbers-range",
    "title": "Bitwise AND of Numbers Range",
    "difficulty": "Medium",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 54.9,
    "totalSubmissions": 204500,
    "description": [
      "Return the bitwise AND of ALL integers in the inclusive range `[left, right]` — without iterating the range."
    ],
    "examples": [
      {
        "input": "left = 5, right = 7",
        "output": "4",
        "explanation": "5 & 6 & 7 = 4."
      },
      {
        "input": "left = 1, right = 2147483647",
        "output": "0"
      }
    ],
    "constraints": [
      "0 <= left <= right <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rangeBitwiseAnd(left, right) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rangeBitwiseAnd(left, right): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef range_bitwise_and(left, right):\n    pass\n"
    }
  },
  {
    "id": 1300,
    "slug": "maximum-product-of-word-lengths",
    "title": "Maximum Product of Word Lengths",
    "difficulty": "Medium",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 44.6,
    "totalSubmissions": 195200,
    "description": [
      "Return the maximum of `words[i].length * words[j].length` over pairs of words that share NO common letters, or `0` if no such pair exists."
    ],
    "examples": [
      {
        "input": "words = [\"abcw\",\"baz\",\"foo\",\"bar\",\"xtfn\",\"abcdef\"]",
        "output": "16",
        "explanation": "\"abcw\" and \"xtfn\"."
      },
      {
        "input": "words = [\"a\",\"aa\",\"aaa\",\"aaaa\"]",
        "output": "0"
      }
    ],
    "constraints": [
      "2 <= words.length <= 1000",
      "Lowercase letters only"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProduct(words) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxProduct(words): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_product(words):\n    pass\n"
    }
  },
  {
    "id": 1301,
    "slug": "hamming-distance",
    "title": "Hamming Distance",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 65,
    "totalSubmissions": 229900,
    "description": [
      "The **Hamming distance** between two integers is the number of bit positions at which their binary representations differ. Given `x` and `y`, return their Hamming distance.",
      "From *interactive-coding-challenges* (Bit Manipulation: number of bits to flip to convert a into b)."
    ],
    "examples": [
      {
        "input": "x = 1, y = 4",
        "output": "2",
        "explanation": "0001 vs 0100 differ in 2 positions."
      },
      {
        "input": "x = 3, y = 1",
        "output": "1"
      }
    ],
    "constraints": [
      "0 <= x, y <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hammingDistance(x, y) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction hammingDistance(x, y): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef hamming_distance(x, y):\n    pass\n"
    }
  },
  {
    "id": 1302,
    "slug": "single-number-iii",
    "title": "Single Number III",
    "difficulty": "Medium",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 46.3,
    "totalSubmissions": 124700,
    "description": [
      "Exactly two elements of `nums` appear only once; every other element appears exactly twice. Return the two single elements, in ascending order.",
      "From AlgoMaster **AM-600** (Bit Manipulation)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,1,3,2,5]",
        "output": "[3,5]"
      },
      {
        "input": "nums = [0,1]",
        "output": "[0,1]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 3·10^4",
      "Exactly two elements appear once"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNumber(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction singleNumber(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef single_number(nums):\n    pass\n"
    }
  },
  {
    "id": 1303,
    "slug": "set-mismatch",
    "title": "Set Mismatch",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 75.8,
    "totalSubmissions": 251500,
    "description": [
      "You have the numbers `1…n` but one number got duplicated (replacing another), so one value appears twice and one is missing. Given the array `nums`, return `[duplicated, missing]`.",
      "From AlgoMaster **AM-600** (Bit Manipulation)."
    ],
    "examples": [
      {
        "input": "nums = [1,2,2,4]",
        "output": "[2,3]"
      },
      {
        "input": "nums = [1,1]",
        "output": "[1,2]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "nums contains values from 1..n"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findErrorNums(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findErrorNums(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_error_nums(nums):\n    pass\n"
    }
  },
  {
    "id": 1304,
    "slug": "number-complement",
    "title": "Number Complement",
    "difficulty": "Easy",
    "tags": [
      "Bit Manipulation"
    ],
    "acceptanceRate": 77.4,
    "totalSubmissions": 186800,
    "description": [
      "Given a positive integer `num`, return its **complement**: the number you get by flipping every bit in its binary representation (ignoring leading zeros). E.g. 5 is `101` → `010` = 2.",
      "Canonical must-do (AM-600 Bit Manipulation family)."
    ],
    "examples": [
      {
        "input": "num = 5",
        "output": "2",
        "explanation": "101 → 010."
      },
      {
        "input": "num = 1",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= num < 2^31"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findComplement(num) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findComplement(num): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_complement(num):\n    pass\n"
    }
  },
  {
    "id": 1305,
    "slug": "plus-one",
    "title": "Plus One",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 71.5,
    "totalSubmissions": 166600,
    "description": [
      "Given `digits` representing a large integer (most significant first, no leading zeros), add one and return the resulting digit array."
    ],
    "examples": [
      {
        "input": "digits = [1,2,3]",
        "output": "[1,2,4]"
      },
      {
        "input": "digits = [9,9]",
        "output": "[1,0,0]"
      }
    ],
    "constraints": [
      "1 <= digits.length <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction plusOne(digits) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction plusOne(digits): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef plus_one(digits):\n    pass\n"
    }
  },
  {
    "id": 1306,
    "slug": "happy-number",
    "title": "Happy Number",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 58.4,
    "totalSubmissions": 234600,
    "description": [
      "Replace `n` by the sum of the squares of its digits, repeatedly. If the process reaches 1, `n` is happy — return whether it does (unhappy numbers loop forever)."
    ],
    "examples": [
      {
        "input": "n = 19",
        "output": "true",
        "explanation": "1²+9²=82 → 68 → 100 → 1."
      },
      {
        "input": "n = 2",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isHappy(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isHappy(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_happy(n):\n    pass\n"
    }
  },
  {
    "id": 1307,
    "slug": "sqrt-x",
    "title": "Sqrt(x)",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 58.9,
    "totalSubmissions": 213600,
    "description": [
      "Return the square root of the non-negative integer `x`, rounded DOWN to the nearest integer. Do not use built-in exponent/sqrt functions."
    ],
    "examples": [
      {
        "input": "x = 4",
        "output": "2"
      },
      {
        "input": "x = 8",
        "output": "2",
        "explanation": "√8 ≈ 2.83, rounded down."
      }
    ],
    "constraints": [
      "0 <= x <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mySqrt(x) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction mySqrt(x): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef my_sqrt(x):\n    pass\n"
    }
  },
  {
    "id": 1308,
    "slug": "reverse-integer",
    "title": "Reverse Integer",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 59.3,
    "totalSubmissions": 110400,
    "description": [
      "Reverse the digits of a signed 32-bit integer `x`. If the reversed value overflows the range `[-2^31, 2^31 - 1]`, return `0`."
    ],
    "examples": [
      {
        "input": "x = 123",
        "output": "321"
      },
      {
        "input": "x = -123",
        "output": "-321"
      },
      {
        "input": "x = 120",
        "output": "21"
      }
    ],
    "constraints": [
      "-2^31 <= x <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverse(x) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction reverse(x): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef reverse(x):\n    pass\n"
    }
  },
  {
    "id": 1309,
    "slug": "pow-x-n",
    "title": "Pow(x, n)",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 53.1,
    "totalSubmissions": 182000,
    "description": [
      "Implement `pow(x, n)` computing x raised to the integer power `n` (which may be negative), in O(log n) multiplications."
    ],
    "examples": [
      {
        "input": "x = 2, n = 10",
        "output": "1024"
      },
      {
        "input": "x = 2.1, n = 3",
        "output": "9.261"
      },
      {
        "input": "x = 2, n = -2",
        "output": "0.25"
      }
    ],
    "constraints": [
      "-100 < x < 100",
      "-2^31 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction myPow(x, n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction myPow(x, n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef my_pow(x, n):\n    pass\n"
    }
  },
  {
    "id": 1310,
    "slug": "count-primes",
    "title": "Count Primes",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 40.8,
    "totalSubmissions": 252900,
    "description": [
      "Return the number of prime numbers STRICTLY less than `n`."
    ],
    "examples": [
      {
        "input": "n = 10",
        "output": "4",
        "explanation": "2, 3, 5, 7."
      },
      {
        "input": "n = 0",
        "output": "0"
      },
      {
        "input": "n = 1",
        "output": "0"
      }
    ],
    "constraints": [
      "0 <= n <= 5 * 10^6"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countPrimes(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction countPrimes(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef count_primes(n):\n    pass\n"
    }
  },
  {
    "id": 1311,
    "slug": "rotate-image",
    "title": "Rotate Image",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 48,
    "totalSubmissions": 205300,
    "description": [
      "Rotate the `n × n` matrix 90 degrees CLOCKWISE, in place (modify and return the input matrix, no second matrix)."
    ],
    "examples": [
      {
        "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        "output": "[[7,4,1],[8,5,2],[9,6,3]]"
      },
      {
        "input": "matrix = [[1]]",
        "output": "[[1]]"
      }
    ],
    "constraints": [
      "1 <= n <= 20"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rotate(matrix) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction rotate(matrix): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef rotate(matrix):\n    pass\n"
    }
  },
  {
    "id": 1312,
    "slug": "spiral-matrix",
    "title": "Spiral Matrix",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 49.9,
    "totalSubmissions": 127600,
    "description": [
      "Return all elements of the `m × n` matrix in clockwise spiral order, starting from the top-left."
    ],
    "examples": [
      {
        "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        "output": "[1,2,3,6,9,8,7,4,5]"
      },
      {
        "input": "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
        "output": "[1,2,3,4,8,12,11,10,9,5,6,7]"
      }
    ],
    "constraints": [
      "1 <= m, n <= 10"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction spiralOrder(matrix) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction spiralOrder(matrix): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef spiral_order(matrix):\n    pass\n"
    }
  },
  {
    "id": 1313,
    "slug": "set-matrix-zeroes",
    "title": "Set Matrix Zeroes",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 40.5,
    "totalSubmissions": 209200,
    "description": [
      "If an element of the matrix is 0, set its ENTIRE row and column to 0, in place. Return the matrix."
    ],
    "examples": [
      {
        "input": "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
        "output": "[[1,0,1],[0,0,0],[1,0,1]]"
      },
      {
        "input": "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
        "output": "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]"
      }
    ],
    "constraints": [
      "1 <= m, n <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction setZeroes(matrix) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction setZeroes(matrix): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef set_zeroes(matrix):\n    pass\n"
    }
  },
  {
    "id": 1314,
    "slug": "max-points-on-a-line",
    "title": "Max Points on a Line",
    "difficulty": "Hard",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 36.1,
    "totalSubmissions": 211700,
    "description": [
      "Given `points` on a plane, return the maximum number of points lying on one straight line."
    ],
    "examples": [
      {
        "input": "points = [[1,1],[2,2],[3,3]]",
        "output": "3"
      },
      {
        "input": "points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= points.length <= 300",
      "All points distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxPoints(points) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction maxPoints(points): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef max_points(points):\n    pass\n"
    }
  },
  {
    "id": 1315,
    "slug": "add-digits",
    "title": "Add Digits (digital root)",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 76,
    "totalSubmissions": 115100,
    "description": [
      "Given a non-negative integer `num`, repeatedly add its digits until the result has a single digit, and return it. Example: 38 → 3+8 = 11 → 1+1 = 2.",
      "From *interactive-coding-challenges* (Mathematics & Probability: find the digital root)."
    ],
    "examples": [
      {
        "input": "num = 38",
        "output": "2"
      },
      {
        "input": "num = 0",
        "output": "0"
      }
    ],
    "constraints": [
      "0 <= num <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction addDigits(num) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction addDigits(num): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef add_digits(num):\n    pass\n"
    }
  },
  {
    "id": 1316,
    "slug": "roman-to-integer",
    "title": "Roman to Integer",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 79.2,
    "totalSubmissions": 291000,
    "description": [
      "Given a Roman numeral string `s` (symbols I=1, V=5, X=10, L=50, C=100, D=500, M=1000, with the usual subtractive cases like IV=4, IX=9, XL=40…), return its integer value.",
      "Canonical must-do (AM-600 Math family)."
    ],
    "examples": [
      {
        "input": "s = \"III\"",
        "output": "3"
      },
      {
        "input": "s = \"MCMXCIV\"",
        "output": "1994",
        "explanation": "M=1000, CM=900, XC=90, IV=4."
      }
    ],
    "constraints": [
      "1 <= s.length <= 15",
      "s is a valid Roman numeral in [1, 3999]"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction romanToInt(s) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction romanToInt(s): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef roman_to_int(s):\n    pass\n"
    }
  },
  {
    "id": 1317,
    "slug": "factorial-trailing-zeroes",
    "title": "Factorial Trailing Zeroes",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 43.1,
    "totalSubmissions": 126000,
    "description": [
      "Given an integer `n`, return the number of trailing zeros in `n!` (n factorial). Aim for better than O(n).",
      "Canonical must-do (AM-600 Math family)."
    ],
    "examples": [
      {
        "input": "n = 3",
        "output": "0",
        "explanation": "3! = 6."
      },
      {
        "input": "n = 5",
        "output": "1",
        "explanation": "5! = 120."
      },
      {
        "input": "n = 25",
        "output": "6"
      }
    ],
    "constraints": [
      "0 <= n <= 10^4"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction trailingZeroes(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction trailingZeroes(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef trailing_zeroes(n):\n    pass\n"
    }
  },
  {
    "id": 1318,
    "slug": "palindrome-number",
    "title": "Palindrome Number",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 68.8,
    "totalSubmissions": 103200,
    "description": [
      "Given an integer `x`, return `true` if it reads the same forwards and backwards. Solve it **without converting to a string**.",
      "Canonical must-do (AM-600 Math family)."
    ],
    "examples": [
      {
        "input": "x = 121",
        "output": "true"
      },
      {
        "input": "x = -121",
        "output": "false",
        "explanation": "Reads -121 vs 121-."
      },
      {
        "input": "x = 10",
        "output": "false"
      }
    ],
    "constraints": [
      "-2^31 <= x <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPalindromeNumber(x) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction isPalindromeNumber(x): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef is_palindrome_number(x):\n    pass\n"
    }
  },
  {
    "id": 1319,
    "slug": "excel-sheet-column-number",
    "title": "Excel Sheet Column Number",
    "difficulty": "Easy",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 52.7,
    "totalSubmissions": 109300,
    "description": [
      "Given a spreadsheet column title (`\"A\"`, `\"B\"`, … `\"Z\"`, `\"AA\"`, `\"AB\"`, …), return its column number.",
      "Canonical must-do (AM-600 Math family)."
    ],
    "examples": [
      {
        "input": "columnTitle = \"A\"",
        "output": "1"
      },
      {
        "input": "columnTitle = \"AB\"",
        "output": "28"
      },
      {
        "input": "columnTitle = \"ZY\"",
        "output": "701"
      }
    ],
    "constraints": [
      "1 <= columnTitle.length <= 7",
      "Uppercase letters only"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction titleToNumber(columnTitle) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction titleToNumber(columnTitle): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef title_to_number(columnTitle):\n    pass\n"
    }
  },
  {
    "id": 1320,
    "slug": "excel-sheet-column-title",
    "title": "Excel Sheet Column Title",
    "difficulty": "Medium",
    "tags": [
      "Math & Geometry"
    ],
    "acceptanceRate": 64.5,
    "totalSubmissions": 151300,
    "description": [
      "Given a positive integer `columnNumber`, return its Excel column title (1 → `\"A\"`, 26 → `\"Z\"`, 27 → `\"AA\"`, 28 → `\"AB\"`, …).",
      "Canonical must-do (AM-600 Math family). The inverse of Excel Sheet Column Number."
    ],
    "examples": [
      {
        "input": "columnNumber = 1",
        "output": "\"A\""
      },
      {
        "input": "columnNumber = 28",
        "output": "\"AB\""
      },
      {
        "input": "columnNumber = 701",
        "output": "\"ZY\""
      }
    ],
    "constraints": [
      "1 <= columnNumber <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction convertToTitle(columnNumber) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction convertToTitle(columnNumber): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef convert_to_title(columnNumber):\n    pass\n"
    }
  },
  {
    "id": 1321,
    "slug": "nim-game",
    "title": "Nim Game",
    "difficulty": "Easy",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 66.2,
    "totalSubmissions": 130400,
    "description": [
      "You and a friend alternate removing 1 to 3 stones from a heap of `n`; you go first, and whoever takes the LAST stone wins. Both play optimally. Return whether you can win."
    ],
    "examples": [
      {
        "input": "n = 4",
        "output": "false",
        "explanation": "Whatever you take, your friend takes the rest."
      },
      {
        "input": "n = 1",
        "output": "true"
      },
      {
        "input": "n = 2",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canWinNim(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canWinNim(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_win_nim(n):\n    pass\n"
    }
  },
  {
    "id": 1322,
    "slug": "divisor-game",
    "title": "Divisor Game",
    "difficulty": "Easy",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 70.3,
    "totalSubmissions": 199000,
    "description": [
      "Starting with `n` on the board, players alternate choosing a divisor `x` of `n` with `0 < x < n` and replacing `n` by `n − x`. A player who cannot move loses. Alice goes first; both play optimally. Return whether Alice wins."
    ],
    "examples": [
      {
        "input": "n = 2",
        "output": "true",
        "explanation": "Alice takes 1, Bob faces 1 and cannot move."
      },
      {
        "input": "n = 3",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= n <= 1000"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction divisorGame(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction divisorGame(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef divisor_game(n):\n    pass\n"
    }
  },
  {
    "id": 1323,
    "slug": "bulb-switcher",
    "title": "Bulb Switcher",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 43.3,
    "totalSubmissions": 230500,
    "description": [
      "There are `n` bulbs, initially off. Round 1 toggles every bulb, round 2 every second bulb, …, round i every i-th bulb, up to round n. Return how many bulbs are ON at the end."
    ],
    "examples": [
      {
        "input": "n = 3",
        "output": "1",
        "explanation": "After the rounds: [on, off, off]."
      },
      {
        "input": "n = 0",
        "output": "0"
      },
      {
        "input": "n = 1",
        "output": "1"
      }
    ],
    "constraints": [
      "0 <= n <= 10^9"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction bulbSwitch(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction bulbSwitch(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef bulb_switch(n):\n    pass\n"
    }
  },
  {
    "id": 1324,
    "slug": "find-the-winner-of-the-circular-game",
    "title": "Find the Winner of the Circular Game",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 59.6,
    "totalSubmissions": 154100,
    "description": [
      "`n` friends sit in a circle, numbered 1..n. Starting the count at friend 1, every `k`-th friend counted leaves the circle, and counting resumes from the next friend. Return the number of the last friend remaining."
    ],
    "examples": [
      {
        "input": "n = 5, k = 2",
        "output": "3",
        "explanation": "Leave order: 2, 4, 1, 5 — friend 3 survives."
      },
      {
        "input": "n = 6, k = 5",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= k <= n <= 500"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findTheWinner(n, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction findTheWinner(n, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef find_the_winner(n, k):\n    pass\n"
    }
  },
  {
    "id": 1325,
    "slug": "stone-game",
    "title": "Stone Game",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 59.1,
    "totalSubmissions": 242200,
    "description": [
      "An EVEN number of `piles` with an odd total lies in a row. Players alternately take the entire pile from either END; Alice goes first. Both play optimally. Return whether Alice wins (ties impossible)."
    ],
    "examples": [
      {
        "input": "piles = [5,3,4,5]",
        "output": "true",
        "explanation": "Alice can always engineer taking 5 and 4."
      },
      {
        "input": "piles = [3,7,2,3]",
        "output": "true"
      }
    ],
    "constraints": [
      "2 <= piles.length <= 500",
      "piles.length is even; total is odd"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction stoneGame(piles) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction stoneGame(piles): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef stone_game(piles):\n    pass\n"
    }
  },
  {
    "id": 1326,
    "slug": "predict-the-winner",
    "title": "Predict the Winner",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 41.4,
    "totalSubmissions": 263200,
    "description": [
      "Players alternately take a number from either END of `nums`, accumulating what they take; Player 1 goes first. Both play optimally. Return whether Player 1 can score at least as much as Player 2 (a tie counts as a win)."
    ],
    "examples": [
      {
        "input": "nums = [1,5,2]",
        "output": "false",
        "explanation": "Whatever Player 1 takes, Player 2 secures the 5."
      },
      {
        "input": "nums = [1,5,233,7]",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 20",
      "0 <= nums[i] <= 10^7"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction predictTheWinner(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction predictTheWinner(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef predict_the_winner(nums):\n    pass\n"
    }
  },
  {
    "id": 1327,
    "slug": "guess-number-higher-or-lower-ii",
    "title": "Guess Number Higher or Lower II",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 33.3,
    "totalSubmissions": 242100,
    "description": [
      "A number is hidden in `[1, n]`. Each wrong guess `g` costs `g` dollars and you learn higher/lower. Return the minimum amount that GUARANTEES you can win regardless of the hidden number."
    ],
    "examples": [
      {
        "input": "n = 10",
        "output": "16"
      },
      {
        "input": "n = 1",
        "output": "0"
      },
      {
        "input": "n = 2",
        "output": "1",
        "explanation": "Guess 1; if wrong it's 2."
      }
    ],
    "constraints": [
      "1 <= n <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getMoneyAmount(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getMoneyAmount(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef get_money_amount(n):\n    pass\n"
    }
  },
  {
    "id": 1328,
    "slug": "chalkboard-xor-game",
    "title": "Chalkboard XOR Game",
    "difficulty": "Hard",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 41.7,
    "totalSubmissions": 224200,
    "description": [
      "Numbers are on a chalkboard. Players alternate ERASING one number; a player who erases a number that leaves the XOR of the rest equal to 0 LOSES — but if the XOR of all numbers is already 0 when your turn STARTS, you WIN. Alice goes first, both optimal. Return whether Alice wins."
    ],
    "examples": [
      {
        "input": "nums = [1,1,2]",
        "output": "false"
      },
      {
        "input": "nums = [0,1]",
        "output": "true"
      },
      {
        "input": "nums = [1,2,3]",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 1000",
      "0 <= nums[i] < 2^16"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction xorGame(nums) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction xorGame(nums): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef xor_game(nums):\n    pass\n"
    }
  },
  {
    "id": 1329,
    "slug": "can-i-win",
    "title": "Can I Win",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 53.3,
    "totalSubmissions": 205100,
    "description": [
      "Players alternately pick DISTINCT integers from 1..`maxChoosableInteger` (each usable once, by either player), adding to a running total. The player whose pick makes the total reach or exceed `desiredTotal` wins. Return whether the FIRST player can force a win (both optimal)."
    ],
    "examples": [
      {
        "input": "maxChoosableInteger = 10, desiredTotal = 11",
        "output": "false",
        "explanation": "Whatever the first player picks, the second can finish."
      },
      {
        "input": "maxChoosableInteger = 10, desiredTotal = 0",
        "output": "true"
      },
      {
        "input": "maxChoosableInteger = 10, desiredTotal = 1",
        "output": "true"
      }
    ],
    "constraints": [
      "1 <= maxChoosableInteger <= 20",
      "0 <= desiredTotal <= 300"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canIWin(maxChoosableInteger, desiredTotal) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction canIWin(maxChoosableInteger, desiredTotal): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef can_i_win(maxChoosableInteger, desiredTotal):\n    pass\n"
    }
  },
  {
    "id": 1330,
    "slug": "poor-pigs",
    "title": "Poor Pigs",
    "difficulty": "Hard",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 28.1,
    "totalSubmissions": 62700,
    "description": [
      "One of `buckets` buckets is poisoned. A pig that drinks poison dies after exactly `minutesToDie` minutes; you have `minutesToTest` minutes total. Pigs can drink from any number of buckets simultaneously, and you can re-test surviving pigs each round. Return the MINIMUM number of pigs needed to guarantee finding the poisoned bucket."
    ],
    "examples": [
      {
        "input": "buckets = 4, minutesToDie = 15, minutesToTest = 15",
        "output": "2"
      },
      {
        "input": "buckets = 4, minutesToDie = 15, minutesToTest = 30",
        "output": "2"
      },
      {
        "input": "buckets = 1000, minutesToDie = 15, minutesToTest = 60",
        "output": "5"
      }
    ],
    "constraints": [
      "1 <= buckets <= 1000",
      "1 <= minutesToDie <= minutesToTest <= 100"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction poorPigs(buckets, minutesToDie, minutesToTest) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction poorPigs(buckets, minutesToDie, minutesToTest): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef poor_pigs(buckets, minutesToDie, minutesToTest):\n    pass\n"
    }
  },
  {
    "id": 1331,
    "slug": "count-of-matches-in-tournament",
    "title": "Count of Matches in Tournament",
    "difficulty": "Easy",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 51.9,
    "totalSubmissions": 88300,
    "description": [
      "In a knockout tournament with `n` teams: if the count is even, teams pair up and half advance; if odd, one team gets a bye and `(n-1)/2` matches are played. Return the **total number of matches** played until one winner remains.",
      "Canonical must-do (AM-600 Math / Game family)."
    ],
    "examples": [
      {
        "input": "n = 7",
        "output": "6"
      },
      {
        "input": "n = 14",
        "output": "13"
      }
    ],
    "constraints": [
      "1 <= n <= 200"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numberOfMatches(n) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction numberOfMatches(n): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef number_of_matches(n):\n    pass\n"
    }
  },
  {
    "id": 1332,
    "slug": "find-the-winner-of-an-array-game",
    "title": "Find the Winner of an Array Game",
    "difficulty": "Medium",
    "tags": [
      "Game Theory & Brain Teasers"
    ],
    "acceptanceRate": 55.8,
    "totalSubmissions": 110500,
    "description": [
      "The first two elements of `arr` compare; the larger wins and stays at the front, the loser goes to the end. Return the first element that wins **k consecutive** rounds.",
      "Canonical must-do (AM-600 Game / Simulation family)."
    ],
    "examples": [
      {
        "input": "arr = [2,1,3,5,4,6,7], k = 2",
        "output": "5"
      },
      {
        "input": "arr = [3,2,1], k = 10",
        "output": "3"
      }
    ],
    "constraints": [
      "2 <= arr.length <= 10^5",
      "1 <= k <= 10^9",
      "values are distinct"
    ],
    "starterCode": {
      "javascript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getWinner(arr, k) {\n  \n}\n",
      "typescript": "/**\n * Write your solution below, then hit Run.\n */\nfunction getWinner(arr, k): unknown {\n  \n}\n",
      "python": "# Write your solution below, then hit Run.\ndef get_winner(arr, k):\n    pass\n"
    }
  }
];
