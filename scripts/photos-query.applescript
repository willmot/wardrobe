on run argv
    if (count of argv) < 3 then error "Usage: photos-query.applescript <search name> <cutoff date> <end date>"
    set searchName to item 1 of argv
    set cutoffDate to date (item 2 of argv)
    set endDate to date (item 3 of argv)
    set outputLines to {}

    tell application "Photos"
        set matches to search for searchName
        repeat with mediaItem in matches
            try
                set capturedAt to date of mediaItem
                if capturedAt is greater than or equal to cutoffDate and capturedAt is less than or equal to endDate then
                    set end of outputLines to ((id of mediaItem) as text) & tab & ((capturedAt as «class isot») as text)
                end if
            end try
        end repeat
    end tell

    set AppleScript's text item delimiters to linefeed
    return outputLines as text
end run
