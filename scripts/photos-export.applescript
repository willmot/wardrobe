on run argv
    if (count of argv) < 4 then error "Usage: photos-export.applescript <search name> <cutoff date> <end date> <destination>"
    set searchName to item 1 of argv
    set cutoffDate to date (item 2 of argv)
    set endDate to date (item 3 of argv)
    set destination to POSIX file (item 4 of argv)
    set outputLines to {}

    tell application "Photos"
        set matches to search for searchName
        repeat with mediaItem in matches
            try
                set capturedAt to date of mediaItem
                if capturedAt is greater than or equal to cutoffDate and capturedAt is less than or equal to endDate then
                    export {mediaItem} to destination using originals true
                    set end of outputLines to ((id of mediaItem) as text) & tab & ((capturedAt as «class isot») as text)
                end if
            end try
        end repeat
    end tell

    set AppleScript's text item delimiters to linefeed
    return outputLines as text
end run
